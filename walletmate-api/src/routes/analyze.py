"""Analyze endpoint - AI-powered proactive insights from transaction history."""

from __future__ import annotations

import json
import logging
from datetime import date
from typing import cast

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from ..config import OPENAI_API_KEY
from ..schemas import AnalyzeRequest, AnalyzeResponse
from ..services.ai import llm

logger = logging.getLogger(__name__)

router = APIRouter()

ANALYZE_PROMPT = """\
You are a proactive personal-finance coach focused on helping users SAVE MORE \
MONEY. Given a user's recent transaction history, generate 3 to 5 concise, \
actionable insights with a strong bias toward practical savings advice.

Input language: {lang_hint}
Today's date: {today}
Analysis period: last {period_days} days

Transaction history:
{history_json}

INSIGHT TYPES (use exactly one per insight):
- "trend": spending or income trend (e.g. "chi tiêu tăng 20% so với tháng trước")
- "anomaly": unusual spike or drop in a category
- "savings": concrete opportunity to save money - THIS IS THE MOST IMPORTANT TYPE
- "recurring": reminder about recurring expenses or subscriptions
- "budget": observation about budget adherence

SEVERITY:
- "info" for neutral observations
- "warning" for concerning trends or overspending
- "success" for positive trends (savings increased, spending decreased)

RULES:
1. Generate 3 to 5 insights. PRIORITIZE at least 1-2 "savings" type insights.
2. Titles should be short (under 60 characters).
3. Descriptions should be 1-2 sentences, specific, and in the input language.
4. Only include insights backed by the provided data.
5. If the history is empty or too sparse, return an empty insights array.
6. category: the affected category name, if any.
7. amount_impact: estimated monthly financial impact as a RAW NUMBER (e.g. \
5000000, not "5.000.000 ₫"). No currency symbols, no formatting. Set to null \
if not quantifiable.
8. Use the user's local currency format in titles and descriptions. \
For Vietnamese (vi) use VND/₫ (e.g., "500.000 ₫" for 500000), never $ or USD. \
For English (en) use $.
9. CRITICAL: The "amount" field in each transaction is a RAW NUMBER. \
Do NOT multiply, inflate, or misread the amounts. \
500000 means five hundred thousand (500k). \
Use the exact numbers from the data in your calculations and descriptions.

SAVINGS-FOCUSED GUIDANCE:
- Look for categories where spending can be reduced (eating out, entertainment, \
shopping sprees).
- Identify subscriptions or recurring charges the user may have forgotten about.
- Compare current month spending vs previous months and highlight if it's going up.
- If there's a high-frequency small expense (daily coffee, snacks), calculate \
the monthly total and suggest how much could be saved by cutting back even \
partially (e.g. "Skipping coffee 2 days/week saves ~X/month").
- If savings rate is below 20%, explicitly recommend a target.
- Praise the user when spending decreases or savings improve (use "success" severity).
- Be specific with numbers, not generic. "You spent 2.5M₫ on Food this month, \
up 30% from last month" is better than "You spent a lot on food."

Respond in JSON format."""


def _serialize_transaction(transaction: dict) -> dict:
    """Normalize a transaction for the prompt.

    Amounts are sent as raw numbers so the LLM can do arithmetic
    without misinterpreting locale-specific formatting (e.g. dots
    as decimal separators vs thousands separators).
    """
    return {
        "date": transaction.get("transactionDate"),
        "description": transaction.get("description"),
        "amount": float(transaction.get("amount", 0)),
        "category": transaction.get("category"),
        "type": transaction.get("type"),
    }


@router.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(body: AnalyzeRequest) -> AnalyzeResponse | JSONResponse:
    """Generate proactive insights from a user's transaction history."""

    if not OPENAI_API_KEY:
        return JSONResponse(
            status_code=503,
            content={"error": "AI service not configured"},
        )

    if not body.transactions:
        return AnalyzeResponse(insights=[])

    lang_hint = "Vietnamese" if body.language == "vi" else "English"

    history_dicts = [{**item.model_dump(), "language": body.language} for item in body.transactions]

    # Cap history length as a safety guardrail.
    max_history_items = 120
    if len(history_dicts) > max_history_items:
        history_dicts = history_dicts[-max_history_items:]

    history_json = json.dumps(
        [_serialize_transaction(item) for item in history_dicts],
        ensure_ascii=False,
        indent=2,
    )

    try:
        structured_llm = llm.with_structured_output(AnalyzeResponse)

        prompt = ANALYZE_PROMPT.format(
            lang_hint=lang_hint,
            today=date.today().isoformat(),
            period_days=body.period_days,
            history_json=history_json,
        )
        result = structured_llm.invoke(prompt)

        # Guard against LLMs that fall back to $ even when the input is VND.
        if body.language == "vi" and hasattr(result, "insights"):
            for insight in result.insights:
                if hasattr(insight, "title"):
                    insight.title = insight.title.replace("$", "₫")
                if hasattr(insight, "description"):
                    insight.description = insight.description.replace("$", "₫")

        return cast(AnalyzeResponse, result)

    except Exception as exc:
        logger.error("AI analyze error: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to analyze transactions"},
        )
