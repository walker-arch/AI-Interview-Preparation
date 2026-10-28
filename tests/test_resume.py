"""
Unit tests for Resume text extraction and classification.
"""

import os
import sys
import pytest

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.resume_service import classify_resume, extract_text_from_docx
from app.services.ml_service import MLService


def test_classify_resume_skills():
    """Verify that classify_resume identifies skills and assigns target role."""
    resume_text = (
        "Senior Cloud Architect with extensive AWS and Kubernetes experience. "
        "Built microservices with Go, Python, and Docker. Implemented CI/CD pipelines via Jenkins."
    )
    skills, role = classify_resume(resume_text)

    assert isinstance(skills, list)
    assert len(skills) > 0
    assert isinstance(role, str)
    assert len(role) > 0


def test_ml_service_predict_skills():
    """Verify MLService skill keyword matcher returns detected domains."""
    ml = MLService()
    text = "Fullstack engineer proficient in React, Next.js, Node, and PostgreSQL databases."
    skills = ml.predict_skills(text)

    assert "JavaScript" in skills or "Frontend" in skills or "SQL" in skills


def test_ml_service_predict_role():
    """Verify MLService assigns role based on text."""
    ml = MLService()
    frontend_text = "Frontend engineer specializing in CSS, HTML, React, Next.js, Tailwind, and UI components."
    role = ml.predict_role(frontend_text)

    assert isinstance(role, str)
    assert len(role) > 0

