"""
Report service: generate PDF interview reports using ReportLab.
"""

import io
import json
import logging
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models import InterviewAnswer, InterviewQuestion, InterviewSession, User

logger = logging.getLogger(__name__)


def generate_session_report(
    db: Session, session_id: int, user_id: int
) -> Optional[bytes]:
    """
    Generate a PDF report for a completed interview session.
    Returns PDF bytes or None if session not found.
    """
    session = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
        .first()
    )

    if not session:
        return None

    user = db.query(User).filter(User.id == user_id).first()

    # Gather Q&A data
    questions = (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.session_id == session_id)
        .order_by(InterviewQuestion.order_num)
        .all()
    )

    qa_pairs = []
    total_score = 0.0
    answered_count = 0

    for q in questions:
        answer = (
            db.query(InterviewAnswer)
            .filter(InterviewAnswer.question_id == q.id)
            .first()
        )
        qa_pairs.append({"question": q, "answer": answer})
        if answer:
            total_score += answer.score
            answered_count += 1

    avg_score = round(total_score / answered_count, 1) if answered_count else 0.0

    # Build PDF
    try:
        return _build_pdf(session, user, qa_pairs, avg_score)
    except Exception as exc:
        logger.error("Failed to generate PDF report: %s", exc)
        return None


def _build_pdf(
    session: InterviewSession,
    user: Optional[User],
    qa_pairs: list,
    avg_score: float,
) -> bytes:
    """Build the actual PDF document using ReportLab."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import inch, mm
    from reportlab.platypus import (
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()
    elements = []

    # ── Title ────────────────────────────────────────────────────────────
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=22,
        spaceAfter=12,
        textColor=colors.HexColor("#1a365d"),
    )
    elements.append(Paragraph("InterviewIQ AI — Session Report", title_style))
    elements.append(Spacer(1, 8))

    # ── Session Info ─────────────────────────────────────────────────────
    info_style = ParagraphStyle(
        "Info",
        parent=styles["Normal"],
        fontSize=11,
        spaceAfter=4,
    )

    user_name = user.full_name if user else "Unknown"
    user_email = user.email if user else ""
    elements.append(Paragraph(f"<b>Candidate:</b> {user_name} ({user_email})", info_style))
    elements.append(Paragraph(f"<b>Target Role:</b> {session.role_target}", info_style))
    elements.append(Paragraph(f"<b>Interview Type:</b> {session.session_type.title()}", info_style))
    elements.append(Paragraph(f"<b>Status:</b> {session.status.title()}", info_style))

    date_str = session.created_at.strftime("%B %d, %Y at %I:%M %p") if session.created_at else "N/A"
    elements.append(Paragraph(f"<b>Date:</b> {date_str}", info_style))
    elements.append(Spacer(1, 12))

    # ── Summary Table ────────────────────────────────────────────────────
    summary_data = [
        ["Metric", "Value"],
        ["Total Questions", str(len(qa_pairs))],
        ["Questions Answered", str(sum(1 for qa in qa_pairs if qa["answer"]))],
        ["Average Score", f"{avg_score:.1f} / 100"],
    ]

    summary_table = Table(summary_data, colWidths=[3 * inch, 3 * inch])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2b6cb0")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 11),
                ("FONTSIZE", (0, 1), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("TOPPADDING", (0, 0), (-1, 0), 10),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
            ]
        )
    )
    elements.append(summary_table)
    elements.append(Spacer(1, 20))

    # ── Questions & Answers ──────────────────────────────────────────────
    section_style = ParagraphStyle(
        "Section",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#2b6cb0"),
        spaceAfter=8,
        spaceBefore=12,
    )
    q_style = ParagraphStyle("Q", parent=styles["Normal"], fontSize=10, spaceAfter=4)
    a_style = ParagraphStyle("A", parent=styles["Normal"], fontSize=10, spaceAfter=4, leftIndent=10)
    feedback_style = ParagraphStyle(
        "Feedback",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#4a5568"),
        leftIndent=10,
        spaceAfter=6,
    )

    elements.append(Paragraph("Detailed Results", section_style))

    for idx, qa in enumerate(qa_pairs, start=1):
        q = qa["question"]
        a = qa["answer"]

        elements.append(
            Paragraph(f"<b>Q{idx}:</b> {q.question_text}", q_style)
        )

        if a:
            # Truncate very long answers for the PDF
            answer_preview = a.answer_text[:500] + ("..." if len(a.answer_text) > 500 else "")
            elements.append(
                Paragraph(f"<b>Answer:</b> {answer_preview}", a_style)
            )
            elements.append(
                Paragraph(
                    f"<b>Score:</b> {a.score:.1f}/100 — <b>{a.quality_label.title()}</b>",
                    a_style,
                )
            )

            # Strengths
            try:
                strengths = json.loads(a.strengths) if a.strengths else []
            except (json.JSONDecodeError, TypeError):
                strengths = []
            if strengths:
                s_text = ", ".join(strengths)
                elements.append(Paragraph(f"<b>Strengths:</b> {s_text}", feedback_style))

            # Weaknesses
            try:
                weaknesses = json.loads(a.weaknesses) if a.weaknesses else []
            except (json.JSONDecodeError, TypeError):
                weaknesses = []
            if weaknesses:
                w_text = ", ".join(weaknesses)
                elements.append(Paragraph(f"<b>Areas to Improve:</b> {w_text}", feedback_style))

            if a.feedback:
                elements.append(Paragraph(f"<b>Feedback:</b> {a.feedback}", feedback_style))
        else:
            elements.append(Paragraph("<i>Not answered</i>", a_style))

        elements.append(Spacer(1, 8))

    # ── Footer ───────────────────────────────────────────────────────────
    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.grey,
        spaceBefore=20,
    )
    elements.append(
        Paragraph(
            f"Generated by InterviewIQ AI on {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
            footer_style,
        )
    )

    doc.build(elements)
    return buffer.getvalue()
