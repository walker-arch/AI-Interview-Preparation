"""
Integration tests for FastAPI endpoints: Auth, Resume, Interview, Dashboard, Reports.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.database import init_db

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db()


def test_root_and_health():
    """Verify root health check endpoint."""
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["database"] == "connected"


def test_auth_and_interview_lifecycle():
    """End-to-end integration test of user registration, interview session, and scoring."""
    import uuid
    random_email = f"candidate_{uuid.uuid4().hex[:8]}@example.com"

    # 1. Register User
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": random_email,
            "full_name": "Alex Candidate",
            "password": "securePassword123",
        },
    )
    assert reg_res.status_code in [200, 201]
    token_data = reg_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Verify current user profile
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == random_email

    # 3. Start Mock Interview
    start_res = client.post(
        "/api/interview/start",
        headers=headers,
        json={
            "role": "Full Stack Developer",
            "session_type": "technical",
            "num_questions": 2,
        },
    )
    assert start_res.status_code in [200, 201]
    session_data = start_res.json()
    session_id = session_data["id"]
    questions = session_data["questions"]
    assert len(questions) == 2

    # 4. Submit Answer for First Question
    q1 = questions[0]
    ans_res = client.post(
        f"/api/interview/{session_id}/answer",
        headers=headers,
        json={
            "question_id": q1["id"],
            "answer_text": "I design APIs by adhering to RESTful resource principles, implementing structured caching via Redis, using connection pooling for databases, and ensuring token-based JWT authentication.",
        },
    )
    assert ans_res.status_code == 200
    eval_data = ans_res.json()
    assert "score" in eval_data
    assert "quality_label" in eval_data
    assert eval_data["score"] >= 0.0

    # 5. Complete Interview Session
    comp_res = client.post(f"/api/interview/{session_id}/complete", headers=headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "completed"

    # 6. Verify Dashboard Stats & Progress
    dash_res = client.get("/api/dashboard/stats", headers=headers)
    assert dash_res.status_code == 200
    stats = dash_res.json()
    assert stats["total_sessions"] >= 1

    progress_res = client.get("/api/dashboard/progress", headers=headers)
    assert progress_res.status_code == 200

