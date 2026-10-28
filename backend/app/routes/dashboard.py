"""
Dashboard routes: statistics and progress tracking.
"""

import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewAnswer, InterviewQuestion, InterviewSession, User, UserProgress
from app.schemas.dashboard import DashboardStats, ProgressPoint, ProgressResponse
from app.services.auth_service import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get overview statistics for the user's dashboard."""
    # Total sessions
    total_sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .count()
    )

    completed_sessions = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == current_user.id,
            InterviewSession.status == "completed",
        )
        .count()
    )

    # All answers
    all_answers = (
        db.query(InterviewAnswer)
        .join(InterviewQuestion)
        .join(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .all()
    )

    total_answered = len(all_answers)
    avg_score = 0.0
    if total_answered:
        avg_score = round(sum(a.score for a in all_answers) / total_answered, 1)

    # Recent score (last completed session)
    recent_score: Optional[float] = None
    last_session = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == current_user.id,
            InterviewSession.status == "completed",
        )
        .order_by(InterviewSession.completed_at.desc())
        .first()
    )

    if last_session:
        last_answers = (
            db.query(InterviewAnswer)
            .join(InterviewQuestion)
            .filter(InterviewQuestion.session_id == last_session.id)
            .all()
        )
        if last_answers:
            recent_score = round(
                sum(a.score for a in last_answers) / len(last_answers), 1
            )

    # Improvement trend
    improvement_trend = _calculate_improvement_trend(db, current_user.id)

    # Skill scores from user progress
    skill_scores = {}
    progress = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id)
        .first()
    )
    if progress and progress.skill_scores:
        try:
            skill_scores = json.loads(progress.skill_scores)
        except (json.JSONDecodeError, TypeError):
            pass

    return DashboardStats(
        total_sessions=total_sessions,
        completed_sessions=completed_sessions,
        avg_score=avg_score,
        improvement_trend=improvement_trend,
        skill_scores=skill_scores,
        recent_score=recent_score,
        total_questions_answered=total_answered,
    )


@router.get("/progress", response_model=ProgressResponse)
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get time-series progress data for charting."""
    completed_sessions = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == current_user.id,
            InterviewSession.status == "completed",
        )
        .order_by(InterviewSession.completed_at.asc())
        .all()
    )

    data_points = []
    for session in completed_sessions:
        answers = (
            db.query(InterviewAnswer)
            .join(InterviewQuestion)
            .filter(InterviewQuestion.session_id == session.id)
            .all()
        )
        if answers:
            avg = round(sum(a.score for a in answers) / len(answers), 1)
            date_str = (
                session.completed_at.strftime("%Y-%m-%d")
                if session.completed_at
                else session.created_at.strftime("%Y-%m-%d")
            )
            data_points.append(
                ProgressPoint(
                    date=date_str,
                    score=avg,
                    session_type=session.session_type,
                )
            )

    overall_trend = _calculate_improvement_trend(db, current_user.id)

    return ProgressResponse(
        data_points=data_points,
        overall_trend=overall_trend,
    )


def _calculate_improvement_trend(db: Session, user_id: int) -> float:
    """
    Calculate improvement trend as percentage change between
    the first half and second half of completed sessions.
    """
    completed = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == user_id,
            InterviewSession.status == "completed",
        )
        .order_by(InterviewSession.completed_at.asc())
        .all()
    )

    if len(completed) < 2:
        return 0.0

    mid = len(completed) // 2
    first_half = completed[:mid]
    second_half = completed[mid:]

    def _avg_score_for_sessions(sessions):
        scores = []
        for s in sessions:
            answers = (
                db.query(InterviewAnswer)
                .join(InterviewQuestion)
                .filter(InterviewQuestion.session_id == s.id)
                .all()
            )
            if answers:
                scores.append(sum(a.score for a in answers) / len(answers))
        return sum(scores) / len(scores) if scores else 0.0

    first_avg = _avg_score_for_sessions(first_half)
    second_avg = _avg_score_for_sessions(second_half)

    if first_avg == 0:
        return 0.0

    return round(((second_avg - first_avg) / first_avg) * 100, 1)
