"""
Pydantic schemas for interview endpoints.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ── Request Schemas ──────────────────────────────────────────────────────

class InterviewStartRequest(BaseModel):
    """Request to start a new interview session."""
    role: str = Field(default="Software Engineer", description="Target role")
    session_type: str = Field(
        default="technical",
        description="Interview type: technical, behavioral, or hr",
        pattern="^(technical|behavioral|hr)$",
    )
    job_description: Optional[str] = Field(
        default=None,
        description="Optional job description for targeted questions",
    )
    num_questions: int = Field(
        default=5, ge=1, le=20, description="Number of questions to generate"
    )


class AnswerSubmitRequest(BaseModel):
    """Request to submit an answer to a question."""
    question_id: int
    answer_text: str = Field(default="", description="The answer text")
    answer: Optional[str] = Field(default=None, description="Alias for answer_text")
    session_id: Optional[int] = Field(default=None, description="Session ID if not in path")

    def model_post_init(self, __context):
        if not self.answer_text and self.answer:
            self.answer_text = self.answer
        elif not self.answer and self.answer_text:
            self.answer = self.answer_text



# ── Response Schemas ─────────────────────────────────────────────────────

class AnswerResponse(BaseModel):
    """Answer evaluation response."""
    id: int
    question_id: int
    answer_text: str
    score: float
    quality_label: str
    strengths: List[str] = []
    weaknesses: List[str] = []
    feedback: str

    class Config:
        from_attributes = True


class QuestionResponse(BaseModel):
    """Interview question response."""
    id: int
    question_text: str
    question_type: str
    order_num: int
    answer: Optional[AnswerResponse] = None

    class Config:
        from_attributes = True


class SessionResponse(BaseModel):
    """Interview session response."""
    id: int
    role_target: str
    session_type: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True


class SessionListItem(BaseModel):
    """Brief session info for lists."""
    id: int
    role_target: str
    session_type: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    num_questions: int = 0
    avg_score: Optional[float] = None

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    """List of sessions."""
    sessions: List[SessionListItem]
    total: int
