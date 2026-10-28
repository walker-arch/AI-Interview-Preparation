"""
Unit tests for InterviewIQ AI Machine Learning Pipeline and Inference Engine.
"""

import os
import sys
import pytest

# Ensure models directory is importable
models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
if models_dir not in sys.path:
    sys.path.insert(0, models_dir)

from inference_pipeline import SkillClassifier, AnswerScorer, InterviewIQPipeline, get_inference_pipeline


@pytest.fixture(scope="module")
def pipeline():
    return get_inference_pipeline()


def test_models_exist():
    """Verify all expected model artifacts exist on disk."""
    expected_files = [
        "skill_classifier.joblib",
        "skill_vectorizer.joblib",
        "skill_label_encoder.joblib",
        "answer_scorer.joblib",
        "answer_vectorizer.joblib",
        "answer_quality_classifier.joblib",
    ]
    for filename in expected_files:
        filepath = os.path.join(models_dir, filename)
        assert os.path.exists(filepath), f"Missing model artifact: {filename}"


def test_skill_extraction(pipeline):
    """Test extracting technical keywords from raw resume text."""
    sample_text = (
        "Software Engineer with 4 years building APIs in Python, FastAPI, and PostgreSQL. "
        "Experienced in React frontend development, Docker containerization, and Git."
    )
    skills = pipeline.skill_classifier.extract_skills(sample_text)
    assert isinstance(skills, list)
    assert len(skills) >= 3
    # Check that core technical skills are caught
    skills_lower = [s.lower() for s in skills]
    assert any("python" in s for s in skills_lower)
    assert any("react" in s for s in skills_lower)
    assert any("postgresql" in s or "sql" in s for s in skills_lower)


def test_role_classification(pipeline):
    """Test predicting role category from resume text."""
    sample_frontend_resume = (
        "Frontend UI/UX Developer proficient in React, Next.js, TypeScript, Tailwind CSS, "
        "and client-side state management. Built interactive responsive web apps."
    )
    result = pipeline.analyze_resume(sample_frontend_resume)
    assert "predicted_role" in result
    assert "confidence" in result
    assert isinstance(result["confidence"], float)
    assert result["confidence"] > 0.0
    assert len(result["extracted_skills"]) > 0


def test_answer_scoring_bounds(pipeline):
    """Test answer scoring returns valid scores within 0-100 range."""
    question = "Explain how database indexing works and why it helps performance."
    answer = (
        "A database index is a data structure, like a B-tree, that speeds up data retrieval "
        "operations on a database table. It avoids scanning every row by providing fast lookup pointers, "
        "though it adds write overhead on inserts and updates."
    )
    res = pipeline.evaluate_answer(question, answer)
    assert "score" in res
    assert "quality_label" in res
    assert 0.0 <= res["score"] <= 100.0
    assert res["quality_label"] in ["poor", "average", "good", "excellent"]


def test_answer_quality_correlation(pipeline):
    """Verify that a thorough answer scores higher than a trivial 1-word answer."""
    question = "What is the difference between TCP and UDP?"
    poor_answer = "idk both are protocols"
    good_answer = (
        "TCP is a connection-oriented, reliable transport protocol that ensures packet delivery, "
        "in-order transmission, and error checking using handshakes and acknowledgments. "
        "In contrast, UDP is connectionless and lightweight, providing faster transmission without "
        "guaranteed delivery, making it ideal for video streaming and real-time gaming."
    )
    poor_res = pipeline.evaluate_answer(question, poor_answer)
    good_res = pipeline.evaluate_answer(question, good_answer)

    assert good_res["score"] >= poor_res["score"], (
        f"Expected thorough answer ({good_res['score']}) to score >= trivial answer ({poor_res['score']})"
    )

