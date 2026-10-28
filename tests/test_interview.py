"""
Unit tests for Interview question generation, answer scoring, and session flow.
"""

import os
import sys
import pytest

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.interview_service import get_session_avg_score
from app.services.ml_service import MLService
from app.services.llm_service import LLMService


def test_ml_score_answer():
    """Verify that ML service produces scores between 0 and 100 with valid quality labels."""
    ml = MLService()
    question = "How does caching improve API response latency?"
    answer = (
        "Caching stores frequently requested data in fast in-memory stores like Redis or Memcached, "
        "bypassing slow database disk queries and network round-trips, which reduces latency and database load."
    )
    score, label = ml.score_answer(question, answer)

    assert isinstance(score, (int, float))
    assert 0.0 <= score <= 100.0
    assert label in ["poor", "average", "good", "excellent"]


def test_llm_service_fallback_questions():
    """Verify that LLMService returns fallback interview questions when no API key is provided."""
    llm = LLMService()
    questions = llm.generate_questions(role="Full Stack Developer", session_type="technical", num_questions=3)

    assert isinstance(questions, list)
    assert len(questions) == 3
    for q in questions:
        assert isinstance(q, dict)
        assert "question_text" in q
        assert len(q["question_text"]) > 10


def test_llm_service_fallback_evaluation():
    """Verify fallback evaluation produces structured strengths, weaknesses, and scores."""
    llm = LLMService()
    question = "Describe the STAR method."
    answer = "STAR stands for Situation, Task, Action, and Result. It is used to answer behavioral interview questions."
    eval_res = llm.evaluate_answer(question=question, answer=answer, role="Software Engineer", session_type="behavioral")

    assert "score" in eval_res
    assert "quality_label" in eval_res
    assert "strengths" in eval_res
    assert "weaknesses" in eval_res
    assert "feedback" in eval_res
    assert isinstance(eval_res["strengths"], list)
