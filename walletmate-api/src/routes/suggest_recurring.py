"""Recurring suggestion endpoint - AI-powered recurrence detection."""

from __future__ import annotations

import json
import logging
from datetime import date
from typing import cast

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from ..config import OPENAI_API_KEY
from ..schemas import SuggestRecurringRequest, SuggestRecurringResponse
from ..services.ai import llm

logger = logging.getLogger(__name__)

router = APIRouter()

SUGGEST_RECURRING_PROMPT = """\
You are a financial-pattern assistant. Given a candidate transaction the user \
is about to save and a limited history of their recent transactions, decide \
whether the candidate is likely a recurring transaction.

Input language: {lang_hint}
Today's date: {today}

Candidate transaction:
{candidate_json}

Recent transaction history (previous + current month only):
{history_json}

RULES:

1. Mark "recurring": true only when the candidate strongly resembles a \
transaction that has appeared multiple times in the history with a similar \
amount, description, or category.

2. Use "recurringFreq" to indicate the most likely interval:
   - "daily" - e.g. commute, daily coffee, subscription trials
   - "weekly" - e.g. weekly groceries, gym, allowance
   - "monthly" - e.g. rent, salary, subscriptions, bills (DEFAULT if uncertain)
   - "yearly" - e.g. insurance premium, domain renewal, annual fee

3. "confidence":
   - "high" - the same description + very close amount appears 3+ times
   - "medium" - similar description or similar amount appears 2+ times
   - "low" - weak or no pattern

4. "reason": A concise, human-readable explanation in the input language. \
If not recurring, briefly say why.

Respond in JSON format."""


def _format_amount(amount: float, language: str) -> str:
    """Format amount for prompt display."""
    if language == "vi":
        return f"{amount:,.0f} VND".replace(",", ".")
    return f"${amount:,.2f}"


def _serialize_transaction(transaction: dict) -> dict:
    """Normalize a transaction for the prompt."""
    return {
        "date": transaction.get("transactionDate"),
        "description": transaction.get("description"),
        "amount": _format_amount(
            float(transaction.get("amount", 0)),
            transaction.get("language", "vi"),
        ),
        "category": transaction.get("category"),
        "type": transaction.get("type"),
    }


@router.post("/api/suggest-recurring", response_model=SuggestRecurringResponse)
def suggest_recurring(body: SuggestRecurringRequest) -> SuggestRecurringResponse | JSONResponse:
    """Suggest whether a candidate transaction should be marked as recurring."""

    if not OPENAI_API_KEY:
        return JSONResponse(
            status_code=503,
            content={"error": "AI service not configured"},
        )

    lang_hint = "Vietnamese" if body.language == "vi" else "English"
    candidate_dict = body.candidate.model_dump()
    candidate_dict["language"] = body.language

    history_dicts = [{**item.model_dump(), "language": body.language} for item in body.history]

    # Cap history length as a safety guardrail.
    max_history_items = 60
    if len(history_dicts) > max_history_items:
        history_dicts = history_dicts[:max_history_items]

    candidate_json = json.dumps(
        _serialize_transaction(candidate_dict),
        ensure_ascii=False,
        indent=2,
    )
    history_json = json.dumps(
        [_serialize_transaction(item) for item in history_dicts],
        ensure_ascii=False,
        indent=2,
    )

    try:
        structured_llm = llm.with_structured_output(SuggestRecurringResponse)

        prompt = SUGGEST_RECURRING_PROMPT.format(
            lang_hint=lang_hint,
            today=date.today().isoformat(),
            candidate_json=candidate_json,
            history_json=history_json,
        )
        result = structured_llm.invoke(prompt)

        return cast(SuggestRecurringResponse, result)

    except Exception as exc:
        logger.error("AI recurring suggestion error: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to suggest recurrence"},
        )
