"""
Interview routes: start sessions, submit answers, complete sessions, view history.
"""

import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewAnswer, InterviewQuestion, InterviewSession, User
from app.schemas.interview import (
    AnswerResponse,
    AnswerSubmitRequest,
    InterviewStartRequest,
    QuestionResponse,
    SessionListItem,
    SessionListResponse,
    SessionResponse,
)
from app.services.auth_service import get_current_user
from app.services.interview_service import (
    complete_session,
    get_session_avg_score,
    start_session,
    submit_answer,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/interview", tags=["Interview"])


@router.post("/start", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def start_interview(
    payload: InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a new interview session with generated questions."""
    try:
        session = start_session(
            db=db,
            user_id=current_user.id,
            role=payload.role,
            session_type=payload.session_type,
            job_description=payload.job_description,
            num_questions=payload.num_questions,
        )
    except Exception as exc:
        logger.error("Failed to start interview session: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start interview session. Please try again.",
        )

    return _session_to_response(session)


@router.get("/history", response_model=SessionListResponse)
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the user's interview session history."""
    query = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    )

    if session_type:
        query = query.filter(InterviewSession.session_type == session_type)

    total = query.count()
    sessions = (
        query.order_by(InterviewSession.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    items = []
    for s in sessions:
        num_questions = (
            db.query(InterviewQuestion)
            .filter(InterviewQuestion.session_id == s.id)
            .count()
        )
        avg_score = get_session_avg_score(db, s.id)

        items.append(
            SessionListItem(
                id=s.id,
                role_target=s.role_target,
                session_type=s.session_type,
                status=s.status,
                created_at=s.created_at,
                completed_at=s.completed_at,
                num_questions=num_questions,
                avg_score=avg_score,
            )
        )

    return SessionListResponse(sessions=items, total=total)


@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific interview session with its questions and answers."""
    session = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    return _session_to_response(session)


@router.post("/answer", response_model=AnswerResponse)
def submit_interview_answer_direct(
    payload: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Direct answer submission supporting session_id in payload."""
    if not payload.session_id:
        # If no session_id provided, find session via question
        q = db.query(InterviewQuestion).filter(InterviewQuestion.id == payload.question_id).first()
        if not q:
            raise HTTPException(status_code=404, detail="Question not found")
        payload.session_id = q.session_id

    return submit_interview_answer(
        session_id=payload.session_id,
        payload=payload,
        db=db,
        current_user=current_user,
    )


@router.get("/history/{session_id}", response_model=SessionResponse)
def get_session_history_by_id(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Alias for getting full session details by ID."""
    return get_session(session_id=session_id, db=db, current_user=current_user)


@router.post("/{session_id}/answer", response_model=AnswerResponse)
def submit_interview_answer(
    session_id: int,
    payload: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit an answer to an interview question and receive AI evaluation."""
    # Verify session belongs to user and is active
    session = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This session is no longer active",
        )

    try:
        answer = submit_answer(
            db=db,
            session_id=session_id,
            question_id=payload.question_id,
            answer_text=payload.answer_text,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return _answer_to_response(answer)


@router.post("/{session_id}/complete", response_model=SessionResponse)
def complete_interview(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark an interview session as completed."""
    try:
        session = complete_session(db, session_id, current_user.id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return _session_to_response(session)


# ── Helper Functions ─────────────────────────────────────────────────────

def _answer_to_response(answer: InterviewAnswer) -> AnswerResponse:
    """Convert an InterviewAnswer ORM object to a response schema."""
    try:
        strengths = json.loads(answer.strengths) if answer.strengths else []
    except (json.JSONDecodeError, TypeError):
        strengths = []
    try:
        weaknesses = json.loads(answer.weaknesses) if answer.weaknesses else []
    except (json.JSONDecodeError, TypeError):
        weaknesses = []

    return AnswerResponse(
        id=answer.id,
        question_id=answer.question_id,
        answer_text=answer.answer_text,
        score=answer.score,
        quality_label=answer.quality_label,
        strengths=strengths,
        weaknesses=weaknesses,
        feedback=answer.feedback or "",
    )


def _session_to_response(session: InterviewSession) -> SessionResponse:
    """Convert an InterviewSession ORM object to a response schema."""
    questions = []
    for q in session.questions:
        answer_resp = None
        if q.answer:
            answer_resp = _answer_to_response(q.answer)

        questions.append(
            QuestionResponse(
                id=q.id,
                question_text=q.question_text,
                question_type=q.question_type,
                order_num=q.order_num,
                answer=answer_resp,
            )
        )

    return SessionResponse(
        id=session.id,
        role_target=session.role_target,
        session_type=session.session_type,
        status=session.status,
        created_at=session.created_at,
        completed_at=session.completed_at,
        questions=questions,
    )
