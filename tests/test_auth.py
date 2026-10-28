"""
Unit tests for Authentication services, password hashing, and JWT tokens.
"""

import os
import sys
import pytest

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.auth_service import hash_password, verify_password, create_access_token, decode_token
from app.schemas.auth import UserRegister, UserLogin


def test_password_hashing():
    """Verify password hashing generates unique bcrypt hashes and validates matches."""
    plain = "securePassword123"
    hashed = hash_password(plain)

    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("wrongPassword", hashed) is False


def test_jwt_token_flow():
    """Verify creating and decoding signed JWT access tokens."""
    data = {"sub": "user_42", "role": "candidate"}
    token = create_access_token(data)

    assert isinstance(token, str)
    assert len(token) > 20

    decoded = decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user_42"
    assert decoded["role"] == "candidate"
    assert "exp" in decoded


def test_invalid_jwt_token():
    """Verify decoding tampered token returns None."""
    tampered_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"
    assert decode_token(tampered_token) is None


def test_user_schemas():
    """Verify pydantic authentication schemas validation."""
    reg = UserRegister(email="test@interviewiq.ai", full_name="Test User", password="password123")
    assert reg.email == "test@interviewiq.ai"
    assert reg.full_name == "Test User"

    login = UserLogin(email="test@interviewiq.ai", password="password123")
    assert login.email == "test@interviewiq.ai"

