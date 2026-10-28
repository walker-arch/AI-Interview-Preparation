"""
SQLAlchemy ORM models for InterviewIQ AI.
"""

import json
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from app.database import Base


# ── Helper: store JSON in TEXT columns ────────────────────────────────────
def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=_now_utc)

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    raw_text = Column(Text, default="")
    extracted_skills = Column(Text, default="[]")  # JSON list
    role_category = Column(String(100), default="General")
    uploaded_at = Column(DateTime, default=_now_utc)

    # Relationships
    user = relationship("User", back_populates="resumes")

    @property
    def skills_list(self) -> list:
        try:
            return json.loads(self.extracted_skills) if self.extracted_skills else []
        except (json.JSONDecodeError, TypeError):
            return []

    @skills_list.setter
    def skills_list(self, value: list):
        self.extracted_skills = json.dumps(value)


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_target = Column(String(255), default="Software Engineer")
    session_type = Column(String(50), default="technical")  # technical / behavioral / hr
    status = Column(String(50), default="active")  # active / completed / abandoned
    created_at = Column(DateTime, default=_now_utc)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="sessions")
    questions = relationship(
        "InterviewQuestion",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="InterviewQuestion.order_num",
    )


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="open")  # open / scenario / coding
    order_num = Column(Integer, default=1)

    # Relationships
    session = relationship("InterviewSession", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False)
    answer_text = Column(Text, nullable=False)
    score = Column(Float, default=0.0)
    quality_label = Column(String(50), default="pending")  # excellent / good / average / poor / pending
    strengths = Column(Text, default="[]")  # JSON list
    weaknesses = Column(Text, default="[]")  # JSON list
    feedback = Column(Text, default="")
    answered_at = Column(DateTime, default=_now_utc)

    # Relationships
    question = relationship("InterviewQuestion", back_populates="answer")

    @property
    def strengths_list(self) -> list:
        try:
            return json.loads(self.strengths) if self.strengths else []
        except (json.JSONDecodeError, TypeError):
            return []

    @strengths_list.setter
    def strengths_list(self, value: list):
        self.strengths = json.dumps(value)

    @property
    def weaknesses_list(self) -> list:
        try:
            return json.loads(self.weaknesses) if self.weaknesses else []
        except (json.JSONDecodeError, TypeError):
            return []

    @weaknesses_list.setter
    def weaknesses_list(self, value: list):
        self.weaknesses = json.dumps(value)


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    total_sessions = Column(Integer, default=0)
    avg_score = Column(Float, default=0.0)
    skill_scores = Column(Text, default="{}")  # JSON dict
    last_activity = Column(DateTime, default=_now_utc)

    # Relationships
    user = relationship("User", back_populates="progress")

    @property
    def skill_scores_dict(self) -> dict:
        try:
            return json.loads(self.skill_scores) if self.skill_scores else {}
        except (json.JSONDecodeError, TypeError):
            return {}

    @skill_scores_dict.setter
    def skill_scores_dict(self, value: dict):
        self.skill_scores = json.dumps(value)
