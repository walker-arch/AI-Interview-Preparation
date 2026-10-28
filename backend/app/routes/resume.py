"""
Resume routes: upload, parse, and retrieve skill information.
"""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Resume, User
from app.schemas.resume import ResumeResponse, ResumeUploadResponse, SkillsResponse
from app.services.auth_service import get_current_user
from app.services.resume_service import classify_resume, extract_text, save_upload

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/resume", tags=["Resume"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a resume (PDF or DOCX), extract text, and classify skills.
    """
    # Validate file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read and validate size
    content = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE_MB} MB",
        )

    # Save file
    file_path = save_upload(content, file.filename)

    # Extract text
    raw_text = extract_text(file_path)
    if not raw_text.strip():
        logger.warning("No text extracted from uploaded file: %s", file.filename)

    # Classify skills and role
    skills, role_category = classify_resume(raw_text)

    # Create resume record
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        raw_text=raw_text,
        extracted_skills=json.dumps(skills),
        role_category=role_category,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    logger.info(
        "Resume uploaded for user %s: %s — %d skills, role: %s",
        current_user.id,
        file.filename,
        len(skills),
        role_category,
    )

    return ResumeUploadResponse(
        message="Resume uploaded and analyzed successfully",
        resume=ResumeResponse(
            id=resume.id,
            filename=resume.filename,
            raw_text=resume.raw_text,
            extracted_skills=skills,
            role_category=resume.role_category,
            uploaded_at=resume.uploaded_at,
        ),
    )


@router.get("/skills", response_model=SkillsResponse)
def get_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the user's extracted skills from their latest resume."""
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please upload a resume first.",
        )

    try:
        skills = json.loads(resume.extracted_skills) if resume.extracted_skills else []
    except (json.JSONDecodeError, TypeError):
        skills = []

    return SkillsResponse(
        skills=skills,
        role_category=resume.role_category,
        resume_id=resume.id,
    )


@router.get("/latest", response_model=ResumeResponse)
def get_latest_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the user's most recently uploaded resume."""
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please upload a resume first.",
        )

    try:
        skills = json.loads(resume.extracted_skills) if resume.extracted_skills else []
    except (json.JSONDecodeError, TypeError):
        skills = []

    return ResumeResponse(
        id=resume.id,
        filename=resume.filename,
        raw_text=resume.raw_text,
        extracted_skills=skills,
        role_category=resume.role_category,
        uploaded_at=resume.uploaded_at,
    )
