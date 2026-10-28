"""
Pydantic schemas for resume endpoints.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ResumeResponse(BaseModel):
    """Resume information response."""
    id: int
    filename: str
    raw_text: str
    extracted_skills: List[str] = []
    role_category: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class ResumeUploadResponse(BaseModel):
    """Response after uploading a resume."""
    message: str
    resume: ResumeResponse


class SkillsResponse(BaseModel):
    """Extracted skills response."""
    skills: List[str]
    role_category: str
    resume_id: int
