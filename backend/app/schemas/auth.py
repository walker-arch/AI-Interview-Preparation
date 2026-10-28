"""
Pydantic schemas for authentication endpoints.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ── Request Schemas ──────────────────────────────────────────────────────

class UserRegister(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    full_name: str = Field(default="", min_length=0, max_length=255, description="User's full name")
    name: str = Field(default="", description="Alias for full_name")
    password: str = Field(..., min_length=6, max_length=128, description="Password (min 6 chars)")

    def model_post_init(self, __context):
        if not self.full_name and self.name:
            self.full_name = self.name
        elif not self.name and self.full_name:
            self.name = self.full_name



class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str = Field(..., min_length=1)


# ── Response Schemas ─────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    """User information response."""
    id: int
    email: str
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True


# Resolve forward reference
TokenResponse.model_rebuild()
