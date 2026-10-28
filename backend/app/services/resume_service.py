"""
Resume service: PDF/DOCX text extraction and skill classification.
"""

import logging
import os
from pathlib import Path
from typing import Tuple, List

from app.config import settings
from app.services.ml_service import get_ml_service

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file using PyMuPDF (fitz) or pypdf fallback."""
    try:
        import fitz  # PyMuPDF

        text_parts: list[str] = []
        with fitz.open(file_path) as doc:
            for page in doc:
                text_parts.append(page.get_text())
        return "\n".join(text_parts).strip()
    except ImportError:
        pass
    except Exception as exc:
        logger.warning("fitz extraction failed, trying pypdf: %s", exc)

    try:
        import pypdf

        reader = pypdf.PdfReader(file_path)
        text_parts = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(text_parts).strip()
    except Exception as exc:
        logger.error("Error extracting text from PDF %s: %s", file_path, exc)
        return ""


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file using python-docx."""
    try:
        from docx import Document

        doc = Document(file_path)
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n".join(paragraphs).strip()
    except ImportError:
        logger.error("python-docx not installed — cannot parse DOCX files")
        return ""
    except Exception as exc:
        logger.error("Error extracting text from DOCX %s: %s", file_path, exc)
        return ""


def extract_text(file_path: str) -> str:
    """Extract text from a resume file based on its extension."""
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return extract_text_from_docx(file_path)
    else:
        logger.warning("Unsupported file format: %s", ext)
        return ""


def classify_resume(raw_text: str) -> Tuple[List[str], str]:
    """
    Classify a resume: extract skills and determine role category.
    Returns (skills_list, role_category).
    """
    ml_service = get_ml_service()
    skills = ml_service.predict_skills(raw_text)
    role = ml_service.predict_role(raw_text)
    return skills, role


def save_upload(file_content: bytes, filename: str) -> str:
    """Save uploaded file to the uploads directory. Returns the file path."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Generate a unique filename to avoid collisions
    import uuid
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(file_content)

    logger.info("Saved upload: %s", file_path)
    return file_path
