"""
Interview service: session management, question flow, and answer processing.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.models import (
    InterviewAnswer,
    InterviewQuestion,
    InterviewSession,
    Resume,
    UserProgress,
)
from app.services.llm_service import get_llm_service
from app.services.ml_service import get_ml_service

logger = logging.getLogger(__name__)


def start_session(
    db: Session,
    user_id: int,
    role: str,
    session_type: str,
    job_description: Optional[str] = None,
    num_questions: int = 5,
) -> InterviewSession:
    """
    Start a new interview session:
    1. Create session record
    2. Generate questions via LLM (or fallback)
    3. Persist questions
    """
    # Create the session
    session = InterviewSession(
        user_id=user_id,
        role_target=role,
        session_type=session_type,
        status="active",
    )
    db.add(session)
    db.flush()  # Get session.id

    # Gather user's skills from latest resume for context
    skills: Optional[List[str]] = None
    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )
    if latest_resume and latest_resume.extracted_skills:
        try:
            skills = json.loads(latest_resume.extracted_skills)
        except (json.JSONDecodeError, TypeError):
            pass

    # Generate questions
    llm = get_llm_service()
    questions_data = llm.generate_questions(
        role=role,
        session_type=session_type,
        num_questions=num_questions,
        skills=skills,
        job_description=job_description,
    )

    # Persist questions
    for idx, q_data in enumerate(questions_data, start=1):
        question = InterviewQuestion(
            session_id=session.id,
            question_text=q_data["question_text"],
            question_type=q_data.get("question_type", "open"),
            order_num=idx,
        )
        db.add(question)

    db.commit()
    db.refresh(session)
    return session


def submit_answer(
    db: Session,
    session_id: int,
    question_id: int,
    answer_text: str,
    user_id: int,
) -> InterviewAnswer:
    """
    Submit and evaluate an answer to an interview question.
    """
    # Verify the question belongs to the session and user
    question = (
        db.query(InterviewQuestion)
        .join(InterviewSession)
        .filter(
            InterviewQuestion.id == question_id,
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
        .first()
    )

    if not question:
        raise ValueError("Question not found or does not belong to this session")

    # Check if already answered
    if question.answer:
        raise ValueError("This question has already been answered")

    # Get session for context
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()

    # Evaluate using LLM
    llm = get_llm_service()
    evaluation = llm.evaluate_answer(
        question=question.question_text,
        answer=answer_text,
        role=session.role_target if session else "Software Engineer",
        session_type=session.session_type if session else "technical",
    )

    # Also get ML score for blending
    ml = get_ml_service()
    ml_score, ml_label = ml.score_answer(question.question_text, answer_text)

    # Blend LLM and ML scores (prefer LLM when available)
    final_score = evaluation.get("score", ml_score)
    if evaluation.get("score") and ml_score:
        # Weighted average: 70% LLM, 30% ML
        final_score = evaluation["score"] * 0.7 + ml_score * 0.3

    final_label = evaluation.get("quality_label", ml_label)

    # Create answer record
    answer = InterviewAnswer(
        question_id=question_id,
        answer_text=answer_text,
        score=round(final_score, 1),
        quality_label=final_label,
        strengths=json.dumps(evaluation.get("strengths", [])),
        weaknesses=json.dumps(evaluation.get("weaknesses", [])),
        feedback=evaluation.get("feedback", ""),
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)

    return answer


def complete_session(db: Session, session_id: int, user_id: int) -> InterviewSession:
    """Mark a session as completed and update user progress."""
    session = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
        .first()
    )

    if not session:
        raise ValueError("Session not found")

    if session.status == "completed":
        raise ValueError("Session is already completed")

    session.status = "completed"
    session.completed_at = datetime.now(timezone.utc)

    # Update user progress
    _update_user_progress(db, user_id)

    db.commit()
    db.refresh(session)
    return session


def _update_user_progress(db: Session, user_id: int):
    """Recalculate and update user progress stats."""
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()

    if not progress:
        progress = UserProgress(user_id=user_id)
        db.add(progress)

    # Count completed sessions
    completed_sessions = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == user_id,
            InterviewSession.status == "completed",
        )
        .all()
    )

    progress.total_sessions = len(completed_sessions)

    # Calculate average score across all answered questions
    all_answers = (
        db.query(InterviewAnswer)
        .join(InterviewQuestion)
        .join(InterviewSession)
        .filter(InterviewSession.user_id == user_id)
        .all()
    )

    if all_answers:
        total_score = sum(a.score for a in all_answers)
        progress.avg_score = round(total_score / len(all_answers), 1)
    else:
        progress.avg_score = 0.0

    # Calculate skill-level scores based on session types
    skill_scores: Dict[str, List[float]] = {}
    for session in completed_sessions:
        session_answers = (
            db.query(InterviewAnswer)
            .join(InterviewQuestion)
            .filter(InterviewQuestion.session_id == session.id)
            .all()
        )
        if session_answers:
            avg = sum(a.score for a in session_answers) / len(session_answers)
            skill_scores.setdefault(session.session_type, []).append(avg)

    aggregated = {
        skill: round(sum(scores) / len(scores), 1)
        for skill, scores in skill_scores.items()
    }
    progress.skill_scores = json.dumps(aggregated)
    progress.last_activity = datetime.now(timezone.utc)


def get_session_avg_score(db: Session, session_id: int) -> Optional[float]:
    """Calculate the average score for a session."""
    answers = (
        db.query(InterviewAnswer)
        .join(InterviewQuestion)
        .filter(InterviewQuestion.session_id == session_id)
        .all()
    )
    if not answers:
        return None
    return round(sum(a.score for a in answers) / len(answers), 1)
