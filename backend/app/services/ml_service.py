"""
ML model service: loads and runs joblib models for skill classification and answer scoring.
Uses singleton pattern for model loading with graceful fallback when models are unavailable.
"""

import logging
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from app.config import settings

logger = logging.getLogger(__name__)


class MLService:
    """Singleton service for loading and running ML models."""

    _instance: Optional["MLService"] = None

    def __new__(cls) -> "MLService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        self.models_dir = Path(settings.MODELS_DIR)
        self.skill_classifier = None
        self.skill_vectorizer = None
        self.skill_label_encoder = None
        self.answer_scorer = None
        self.answer_vectorizer = None
        self.answer_quality_classifier = None
        self.models_loaded = False

        self._load_models()

    def _load_models(self):
        """Load ML models from disk. Gracefully handles missing models."""
        try:
            import joblib
        except ImportError:
            logger.warning("joblib not installed — ML models will not be loaded")
            return

        model_files = {
            "skill_classifier": "skill_classifier.joblib",
            "skill_vectorizer": "skill_vectorizer.joblib",
            "skill_label_encoder": "skill_label_encoder.joblib",
            "answer_scorer": "answer_scorer.joblib",
            "answer_vectorizer": "answer_vectorizer.joblib",
            "answer_quality_classifier": "answer_quality_classifier.joblib",
        }

        loaded_count = 0
        for attr, filename in model_files.items():
            filepath = self.models_dir / filename
            if filepath.exists():
                try:
                    setattr(self, attr, joblib.load(filepath))
                    loaded_count += 1
                    logger.info("Loaded ML model: %s", filename)
                except Exception as exc:
                    logger.warning("Failed to load %s: %s", filename, exc)
            else:
                logger.info("ML model file not found: %s (using fallback)", filename)

        self.models_loaded = loaded_count > 0
        logger.info(
            "ML service initialized — %d/%d models loaded", loaded_count, len(model_files)
        )

    # ── Skill Classification ─────────────────────────────────────────────

    # Keyword bank used as fallback when ML models are not available
    SKILL_KEYWORDS: Dict[str, List[str]] = {
        "Python": ["python", "django", "flask", "fastapi", "pytorch", "tensorflow"],
        "JavaScript": ["javascript", "react", "node", "vue", "angular", "typescript", "nextjs", "next.js"],
        "Java": ["java", "spring", "hibernate", "maven", "gradle"],
        "SQL": ["sql", "mysql", "postgresql", "postgres", "sqlite", "database", "mongodb"],
        "Cloud": ["aws", "azure", "gcp", "cloud", "docker", "kubernetes", "k8s"],
        "Machine Learning": ["machine learning", "ml", "deep learning", "nlp", "neural network", "ai"],
        "Data Science": ["data science", "pandas", "numpy", "scikit-learn", "data analysis", "statistics"],
        "DevOps": ["devops", "ci/cd", "jenkins", "terraform", "ansible", "github actions"],
        "Frontend": ["html", "css", "react", "vue", "angular", "tailwind", "bootstrap"],
        "Backend": ["api", "rest", "graphql", "microservices", "backend"],
        "Mobile": ["android", "ios", "react native", "flutter", "swift", "kotlin"],
        "Git": ["git", "github", "gitlab", "version control"],
        "Testing": ["testing", "unit test", "pytest", "jest", "selenium", "qa"],
        "Agile": ["agile", "scrum", "kanban", "jira", "sprint"],
        "Communication": ["communication", "teamwork", "leadership", "presentation"],
        "Problem Solving": ["problem solving", "algorithms", "data structures", "leetcode"],
    }

    ROLE_KEYWORDS: Dict[str, List[str]] = {
        "Frontend Developer": ["react", "vue", "angular", "html", "css", "frontend", "ui", "ux"],
        "Backend Developer": ["api", "rest", "django", "flask", "fastapi", "spring", "backend", "server"],
        "Full Stack Developer": ["full stack", "fullstack", "react", "node", "django", "flask"],
        "Data Scientist": ["data science", "machine learning", "pandas", "numpy", "statistics", "ml"],
        "DevOps Engineer": ["devops", "docker", "kubernetes", "ci/cd", "aws", "terraform"],
        "Mobile Developer": ["android", "ios", "react native", "flutter", "mobile"],
        "ML Engineer": ["machine learning", "deep learning", "tensorflow", "pytorch", "model"],
        "Software Engineer": [],  # default
    }

    def predict_skills(self, text: str) -> List[str]:
        """
        Extract and predict technical skills from resume text.
        Extracts matched technical keywords and concepts.
        """
        return self._keyword_skill_extraction(text)

    def _keyword_skill_extraction(self, text: str) -> List[str]:
        """Extract skills using keyword and regex matching."""
        text_lower = text.lower()
        found_skills: List[str] = []

        for skill, keywords in self.SKILL_KEYWORDS.items():
            for keyword in keywords:
                if re.search(r"\b" + re.escape(keyword) + r"\b", text_lower):
                    found_skills.append(skill)
                    break

        return found_skills if found_skills else ["Software Engineering", "Problem Solving"]

    def predict_role(self, text: str) -> str:
        """Predict role category from resume text using ML classifier with keyword fallback."""
        if self.skill_classifier and self.skill_vectorizer:
            try:
                features = self.skill_vectorizer.transform([text])
                pred = self.skill_classifier.predict(features)[0]
                if self.skill_label_encoder is not None:
                    role_str = self.skill_label_encoder.inverse_transform([pred])[0]
                else:
                    role_str = str(pred)
                formatted = role_str.replace("_", " ").title() + " Developer"
                if "Developer Developer" in formatted:
                    formatted = formatted.replace("Developer Developer", "Developer")
                return formatted
            except Exception as exc:
                logger.warning("ML role prediction failed, falling back: %s", exc)

        text_lower = text.lower()
        role_scores: Dict[str, int] = {}

        for role, keywords in self.ROLE_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > 0:
                role_scores[role] = score

        if role_scores:
            return max(role_scores, key=role_scores.get)
        return "Full Stack Developer"

    # ── Answer Scoring ───────────────────────────────────────────────────

    def score_answer(self, question: str, answer: str) -> Tuple[float, str]:
        """
        Score an interview answer.
        Returns (score 0-100, quality_label).
        Uses ML model if available, otherwise heuristic scoring.
        """
        if self.answer_scorer and self.answer_vectorizer:
            try:
                combined = f"{question} [SEP] {answer}"
                features = self.answer_vectorizer.transform([combined])
                score = float(self.answer_scorer.predict(features)[0])
                score = max(10.0, min(99.0, score))
                if self.answer_quality_classifier:
                    quality = str(self.answer_quality_classifier.predict(features)[0])
                else:
                    quality = self._score_to_label(score)
                return score, quality
            except Exception as exc:
                logger.warning("ML answer scoring failed, using fallback: %s", exc)

        return self._heuristic_score(question, answer)

    def _heuristic_score(self, question: str, answer: str) -> Tuple[float, str]:
        """Fallback: heuristic-based answer scoring."""
        score = 0.0

        # Length factor (longer answers tend to be more complete)
        word_count = len(answer.split())
        if word_count >= 150:
            score += 30
        elif word_count >= 100:
            score += 25
        elif word_count >= 50:
            score += 20
        elif word_count >= 20:
            score += 10
        else:
            score += 5

        # Sentence structure
        sentences = [s.strip() for s in re.split(r"[.!?]+", answer) if s.strip()]
        if len(sentences) >= 5:
            score += 15
        elif len(sentences) >= 3:
            score += 10
        else:
            score += 5

        # Keyword relevance: overlap between question and answer keywords
        q_words = set(re.findall(r"\b[a-z]{3,}\b", question.lower()))
        a_words = set(re.findall(r"\b[a-z]{3,}\b", answer.lower()))
        overlap = len(q_words & a_words)
        score += min(overlap * 3, 20)

        # Technical indicator keywords
        tech_words = [
            "because", "therefore", "example", "specifically",
            "approach", "solution", "result", "experience",
            "team", "project", "implemented", "developed",
            "learned", "improved", "achieved", "used",
        ]
        tech_count = sum(1 for tw in tech_words if tw in answer.lower())
        score += min(tech_count * 3, 20)

        # Structure indicators (STAR method, numbered lists)
        structure_words = ["first", "second", "then", "finally", "situation", "task", "action", "result"]
        struct_count = sum(1 for sw in structure_words if sw in answer.lower())
        score += min(struct_count * 3, 15)

        score = max(0.0, min(100.0, score))
        return score, self._score_to_label(score)

    @staticmethod
    def _score_to_label(score: float) -> str:
        """Convert numeric score to quality label."""
        if score >= 85:
            return "excellent"
        elif score >= 70:
            return "good"
        elif score >= 50:
            return "average"
        else:
            return "poor"


# Module-level singleton accessor
def get_ml_service() -> MLService:
    """Get or create the MLService singleton."""
    return MLService()
