"""
LLM service: OpenAI-compatible API client for question generation and answer evaluation.
Supports configurable base URL for local model servers (e.g. LM Studio, Ollama).
Falls back to template-based responses when the API is unavailable.
"""

import json
import logging
import random
from typing import Dict, List, Optional

from app.config import settings

logger = logging.getLogger(__name__)

# ── Fallback Question Banks ─────────────────────────────────────────────

FALLBACK_QUESTIONS: Dict[str, List[str]] = {
    "technical": [
        "Explain the difference between a stack and a queue. When would you use each?",
        "What is the time complexity of common sorting algorithms? Which would you choose for nearly-sorted data?",
        "Describe how you would design a RESTful API for a social media application.",
        "What are SOLID principles? Give an example of how you applied one in a project.",
        "Explain the concept of database normalization and when you might denormalize.",
        "How does garbage collection work in your preferred programming language?",
        "What is the difference between SQL and NoSQL databases? When would you pick one over the other?",
        "Describe how you would implement authentication and authorization in a web application.",
        "What are microservices? What are the trade-offs compared to a monolithic architecture?",
        "Explain how caching works and describe a situation where you implemented it.",
        "What is CI/CD and why is it important? Describe your experience with it.",
        "Explain the CAP theorem and its implications for distributed systems.",
        "How would you handle race conditions in a multi-threaded application?",
        "What are design patterns? Describe one you've used recently.",
        "How would you optimize a slow database query?",
    ],
    "behavioral": [
        "Tell me about a time you faced a significant challenge at work. How did you handle it?",
        "Describe a situation where you had to work with a difficult team member.",
        "Give an example of a time you had to learn a new technology quickly.",
        "Tell me about a project you're most proud of and why.",
        "Describe a time when you had to make a decision with incomplete information.",
        "How do you prioritize tasks when you have multiple deadlines?",
        "Tell me about a time you received critical feedback. How did you respond?",
        "Describe a situation where you had to persuade others to adopt your idea.",
        "Give an example of how you've mentored or helped a colleague grow.",
        "Tell me about a time when a project didn't go as planned.",
    ],
    "hr": [
        "Why are you interested in this role?",
        "Where do you see yourself in five years?",
        "What are your greatest strengths and weaknesses?",
        "Why are you leaving your current position?",
        "What is your expected salary range?",
        "How do you handle work-life balance?",
        "What motivates you in your work?",
        "Describe your ideal work environment.",
        "What do you know about our company?",
        "Do you have any questions for us?",
    ],
}


class LLMService:
    """Service for interacting with OpenAI-compatible LLM APIs."""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = settings.OPENAI_BASE_URL
        self.model = settings.OPENAI_MODEL
        self.client = None

        if self.api_key:
            try:
                from openai import OpenAI

                self.client = OpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url,
                )
                logger.info("OpenAI client initialized (model: %s)", self.model)
            except ImportError:
                logger.warning("openai package not installed — using fallback responses")
            except Exception as exc:
                logger.warning("Failed to initialize OpenAI client: %s", exc)
        else:
            logger.info("No OPENAI_API_KEY set — using fallback question generation")

    def _call_llm(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        """Make a chat completion call to the LLM. Returns None on failure."""
        if not self.client:
            return None

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=2000,
            )
            return response.choices[0].message.content.strip()
        except Exception as exc:
            logger.warning("LLM API call failed: %s", exc)
            return None

    # ── Question Generation ──────────────────────────────────────────────

    def generate_questions(
        self,
        role: str,
        session_type: str,
        num_questions: int = 5,
        skills: Optional[List[str]] = None,
        job_description: Optional[str] = None,
    ) -> List[Dict[str, str]]:
        """
        Generate interview questions.
        Returns list of dicts with 'question_text' and 'question_type'.
        """
        # Try LLM first
        result = self._generate_via_llm(role, session_type, num_questions, skills, job_description)
        if result:
            return result

        # Fallback to template-based questions
        return self._generate_fallback(session_type, num_questions)

    def _generate_via_llm(
        self,
        role: str,
        session_type: str,
        num_questions: int,
        skills: Optional[List[str]],
        job_description: Optional[str],
    ) -> Optional[List[Dict[str, str]]]:
        """Generate questions using the LLM API."""
        system_prompt = (
            "You are an expert interviewer. Generate interview questions "
            "that are specific, professional, and insightful. "
            "Return ONLY a valid JSON array of objects, each with "
            "'question_text' and 'question_type' fields. "
            "question_type should be one of: 'open', 'scenario', 'coding'."
        )

        skills_str = ", ".join(skills) if skills else "general software engineering"
        jd_str = f"\n\nJob Description:\n{job_description}" if job_description else ""

        user_prompt = (
            f"Generate {num_questions} {session_type} interview questions "
            f"for a {role} position.\n"
            f"Candidate skills: {skills_str}{jd_str}\n\n"
            f"Return ONLY a JSON array."
        )

        response = self._call_llm(system_prompt, user_prompt)
        if not response:
            return None

        try:
            # Try to extract JSON from response
            text = response.strip()
            # Handle markdown code blocks
            if "```" in text:
                start = text.find("[")
                end = text.rfind("]") + 1
                if start != -1 and end > start:
                    text = text[start:end]

            questions = json.loads(text)
            if isinstance(questions, list) and len(questions) > 0:
                return [
                    {
                        "question_text": q.get("question_text", q.get("question", "")),
                        "question_type": q.get("question_type", "open"),
                    }
                    for q in questions
                    if q.get("question_text") or q.get("question")
                ]
        except (json.JSONDecodeError, KeyError, TypeError) as exc:
            logger.warning("Failed to parse LLM question response: %s", exc)

        return None

    def _generate_fallback(
        self, session_type: str, num_questions: int
    ) -> List[Dict[str, str]]:
        """Generate questions from the fallback question bank."""
        bank = FALLBACK_QUESTIONS.get(session_type, FALLBACK_QUESTIONS["technical"])
        selected = random.sample(bank, min(num_questions, len(bank)))
        return [
            {"question_text": q, "question_type": "open"}
            for q in selected
        ]

    # ── Answer Evaluation ────────────────────────────────────────────────

    def evaluate_answer(
        self,
        question: str,
        answer: str,
        role: str = "Software Engineer",
        session_type: str = "technical",
    ) -> Dict:
        """
        Evaluate an interview answer using the LLM.
        Returns dict with strengths, weaknesses, feedback.
        """
        result = self._evaluate_via_llm(question, answer, role, session_type)
        if result:
            return result

        return self._evaluate_fallback(question, answer)

    def _evaluate_via_llm(
        self, question: str, answer: str, role: str, session_type: str
    ) -> Optional[Dict]:
        """Evaluate answer using the LLM API."""
        system_prompt = (
            "You are an expert interview coach evaluating a candidate's answer. "
            "Provide detailed, constructive feedback. "
            "Return ONLY valid JSON with these fields:\n"
            '- "strengths": array of strings (specific strengths)\n'
            '- "weaknesses": array of strings (areas for improvement)\n'
            '- "feedback": string (2-3 sentences of overall feedback)\n'
            '- "score": number 0-100\n'
            '- "quality_label": one of "excellent", "good", "average", "poor"'
        )

        user_prompt = (
            f"Role: {role}\nInterview Type: {session_type}\n\n"
            f"Question: {question}\n\n"
            f"Candidate's Answer: {answer}\n\n"
            f"Evaluate this answer and return JSON."
        )

        response = self._call_llm(system_prompt, user_prompt)
        if not response:
            return None

        try:
            text = response.strip()
            if "```" in text:
                start = text.find("{")
                end = text.rfind("}") + 1
                if start != -1 and end > start:
                    text = text[start:end]

            evaluation = json.loads(text)
            return {
                "strengths": evaluation.get("strengths", []),
                "weaknesses": evaluation.get("weaknesses", []),
                "feedback": evaluation.get("feedback", ""),
                "score": float(evaluation.get("score", 50)),
                "quality_label": evaluation.get("quality_label", "average"),
            }
        except (json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
            logger.warning("Failed to parse LLM evaluation response: %s", exc)
            return None

    def _evaluate_fallback(self, question: str, answer: str) -> Dict:
        """Fallback answer evaluation using heuristics."""
        from app.services.ml_service import get_ml_service

        ml = get_ml_service()
        score, label = ml.score_answer(question, answer)

        word_count = len(answer.split())

        strengths = []
        weaknesses = []

        if word_count >= 50:
            strengths.append("Provided a detailed response")
        else:
            weaknesses.append("Answer could be more detailed")

        if any(w in answer.lower() for w in ["example", "instance", "project", "experience"]):
            strengths.append("Included specific examples")
        else:
            weaknesses.append("Consider including specific examples from your experience")

        if any(w in answer.lower() for w in ["because", "therefore", "result", "outcome"]):
            strengths.append("Good use of reasoning and cause-effect relationships")
        else:
            weaknesses.append("Try to explain the reasoning behind your approach")

        if any(w in answer.lower() for w in ["first", "second", "then", "finally"]):
            strengths.append("Well-structured response with clear organization")
        else:
            weaknesses.append("Consider structuring your answer with clear steps or points")

        if not strengths:
            strengths.append("Attempted to answer the question")

        feedback = (
            f"Your answer scored {score:.0f}/100 ({label}). "
            f"{'Keep up the great work!' if score >= 70 else 'There is room for improvement.'} "
            f"Focus on providing specific examples and structuring your response clearly."
        )

        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "feedback": feedback,
            "score": score,
            "quality_label": label,
        }


# Module-level singleton
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create the LLMService singleton."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
