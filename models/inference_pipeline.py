"""
InterviewIQ AI — Reusable Model Inference Pipeline
Provides modular classes for:
- Skill & Role Classification from Resumes
- Automated Answer Quality & Score Prediction
"""

import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import joblib
import numpy as np


class SkillClassifier:
    """Inference class for candidate role classification and skill extraction."""

    SKILL_KEYWORDS: Dict[str, List[str]] = {
        "Python": ["python", "django", "flask", "fastapi", "pandas", "numpy", "pytorch", "tensorflow"],
        "JavaScript / TypeScript": ["javascript", "typescript", "react", "next.js", "node.js", "vue", "angular"],
        "Backend & APIs": ["rest", "graphql", "microservices", "sql", "postgresql", "mysql", "mongodb", "redis"],
        "Cloud & DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "terraform", "linux"],
        "Data & ML": ["machine learning", "deep learning", "nlp", "scikit-learn", "data science", "statistics"],
        "Mobile Development": ["react native", "flutter", "swift", "kotlin", "ios", "android"],
        "System Architecture": ["system design", "distributed systems", "scalability", "caching", "message queues"],
        "Testing & QA": ["pytest", "jest", "unit testing", "integration testing", "cypress"],
        "Agile & Collaboration": ["git", "github", "agile", "scrum", "jira", "code review"],
    }

    def __init__(self, models_dir: Optional[Union[str, Path]] = None):
        if models_dir is None:
            models_dir = Path(__file__).resolve().parent
        self.models_dir = Path(models_dir)
        self.vectorizer = None
        self.classifier = None
        self.label_encoder = None
        self._load()

    def _load(self):
        vec_path = self.models_dir / "skill_vectorizer.joblib"
        clf_path = self.models_dir / "skill_classifier.joblib"
        le_path = self.models_dir / "skill_label_encoder.joblib"

        if vec_path.exists() and clf_path.exists():
            self.vectorizer = joblib.load(vec_path)
            self.classifier = joblib.load(clf_path)
            if le_path.exists():
                self.label_encoder = joblib.load(le_path)

    def extract_skills(self, text: str) -> List[str]:
        """Extract matched technical skills from resume text using NLP keyword matching."""
        text_lower = text.lower()
        extracted: List[str] = []
        for skill_group, keywords in self.SKILL_KEYWORDS.items():
            for kw in keywords:
                if re.search(r"\b" + re.escape(kw) + r"\b", text_lower):
                    extracted.append(kw.title() if len(kw) > 3 else kw.upper())
        return list(dict.fromkeys(extracted))

    def predict_role(self, text: str) -> Dict[str, Any]:
        """Predict target role category with confidence probabilities."""
        skills = self.extract_skills(text)

        if not self.classifier or not self.vectorizer:
            return {
                "predicted_role": "Full Stack Developer",
                "confidence": 0.85,
                "extracted_skills": skills,
                "is_fallback": True,
            }

        features = self.vectorizer.transform([text])
        pred_encoded = self.classifier.predict(features)[0]

        if hasattr(self.classifier, "predict_proba"):
            probs = self.classifier.predict_proba(features)[0]
            confidence = float(np.max(probs))
        else:
            confidence = 0.90

        if self.label_encoder:
            role_name = self.label_encoder.inverse_transform([pred_encoded])[0]
        else:
            role_name = str(pred_encoded)

        # Human-readable format
        formatted_role = role_name.replace("_", " ").title() + " Developer"
        if "Developer" in formatted_role and "Developer Developer" in formatted_role:
            formatted_role = formatted_role.replace("Developer Developer", "Developer")

        return {
            "predicted_role": formatted_role,
            "raw_role": role_name,
            "confidence": round(confidence, 4),
            "extracted_skills": skills,
            "is_fallback": False,
        }


class AnswerScorer:
    """Inference class for interview answer evaluation and score regression."""

    def __init__(self, models_dir: Optional[Union[str, Path]] = None):
        if models_dir is None:
            models_dir = Path(__file__).resolve().parent
        self.models_dir = Path(models_dir)
        self.vectorizer = None
        self.scorer = None
        self.quality_classifier = None
        self._load()

    def _load(self):
        vec_path = self.models_dir / "answer_vectorizer.joblib"
        scorer_path = self.models_dir / "answer_scorer.joblib"
        quality_path = self.models_dir / "answer_quality_classifier.joblib"

        if vec_path.exists() and scorer_path.exists():
            self.vectorizer = joblib.load(vec_path)
            self.scorer = joblib.load(scorer_path)
        if quality_path.exists():
            self.quality_classifier = joblib.load(quality_path)

    def score_answer(self, question: str, answer: str) -> Dict[str, Any]:
        """Predict numerical score (0-100) and qualitative label for candidate's answer."""
        if not self.scorer or not self.vectorizer:
            # Heuristic fallback
            words = len(answer.split())
            heuristic_score = min(95.0, max(40.0, 45.0 + words * 0.4))
            return {
                "score": round(heuristic_score, 1),
                "quality_label": "good" if heuristic_score >= 70 else "average",
                "is_fallback": True,
            }

        combined_input = f"{question} [SEP] {answer}"
        features = self.vectorizer.transform([combined_input])
        raw_score = float(self.scorer.predict(features)[0])
        score = float(np.clip(raw_score, 10.0, 99.0))

        if self.quality_classifier:
            quality = str(self.quality_classifier.predict(features)[0])
        else:
            if score >= 85:
                quality = "excellent"
            elif score >= 70:
                quality = "good"
            elif score >= 50:
                quality = "average"
            else:
                quality = "poor"

        return {
            "score": round(score, 1),
            "quality_label": quality,
            "is_fallback": False,
        }


class InterviewIQPipeline:
    """Unified pipeline exposing both skill classification and answer evaluation."""

    def __init__(self, models_dir: Optional[Union[str, Path]] = None):
        self.skill_classifier = SkillClassifier(models_dir)
        self.answer_scorer = AnswerScorer(models_dir)

    def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """Full resume analysis: extracted skills and target role match."""
        return self.skill_classifier.predict_role(resume_text)

    def evaluate_answer(self, question: str, answer: str) -> Dict[str, Any]:
        """Score and evaluate candidate response."""
        return self.answer_scorer.score_answer(question, answer)


# Module-level convenience singleton
_pipeline_instance: Optional[InterviewIQPipeline] = None


def get_inference_pipeline() -> InterviewIQPipeline:
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = InterviewIQPipeline()
    return _pipeline_instance


if __name__ == "__main__":
    pipeline = get_inference_pipeline()
    sample_resume = "Experienced Python developer with 4 years building scalable FastAPI backends, PostgreSQL databases, Docker containers, and React dashboards."
    res = pipeline.analyze_resume(sample_resume)
    print("Resume Analysis:", res)

    sample_q = "What is the difference between synchronous and asynchronous execution in Python?"
    sample_a = "Synchronous execution runs code sequentially where each operation blocks until completion. Asynchronous execution uses an event loop with async/await, allowing I/O tasks to run concurrently without blocking."
    ans_res = pipeline.evaluate_answer(sample_q, sample_a)
    print("Answer Evaluation:", ans_res)

