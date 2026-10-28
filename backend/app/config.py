"""
Application configuration loaded from environment variables.
Uses pydantic-settings for type-safe configuration management.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from .env file and environment variables."""

    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./interviewiq.db"

    # ── JWT Authentication ────────────────────────────────────────────────
    SECRET_KEY: str = "interviewiq-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ── OpenAI / LLM ─────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-3.5-turbo"

    # ── File Uploads ──────────────────────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = str(
        Path(__file__).resolve().parent.parent.parent / "uploads"
    )

    # ── ML Models ─────────────────────────────────────────────────────────
    MODELS_DIR: str = str(
        Path(__file__).resolve().parent.parent.parent / "models"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
