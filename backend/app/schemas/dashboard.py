"""
Pydantic schemas for dashboard endpoints.
"""

from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel


class DashboardStats(BaseModel):
    """Overview statistics for the dashboard."""
    total_sessions: int = 0
    completed_sessions: int = 0
    avg_score: float = 0.0
    improvement_trend: float = 0.0  # percentage change
    skill_scores: Dict[str, float] = {}
    recent_score: Optional[float] = None
    total_questions_answered: int = 0


class ProgressPoint(BaseModel):
    """A single data point in the progress time-series."""
    date: str
    score: float
    session_type: str


class ProgressResponse(BaseModel):
    """Time-series progress data."""
    data_points: List[ProgressPoint] = []
    overall_trend: float = 0.0
