"""Parse text endpoint — AI-powered expense extraction from text input."""

from __future__ import annotations

import logging
from datetime import date
from typing import cast

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from ..config import ALLOWED_CATEGORIES, OPENAI_API_KEY
from ..schemas import ParseTextRequest, ParseTextResponse
from ..services.ai import llm

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/api/parse-text", response_model=ParseTextResponse)
def parse_text(body: ParseTextRequest) -> ParseTextResponse | JSONResponse:
    """Parse free-form text into a structured financial transaction."""

    # Guard: OpenAI key must be configured
    if not OPENAI_API_KEY:
        return JSONResponse(
            status_code=503,
            content={"error": "AI service not configured", "redirect": "/transactions"},
        )

    today = date.today().isoformat()
    lang_hint = "Vietnamese" if body.language == "vi" else "English"
    categories_list = ", ".join(ALLOWED_CATEGORIES)

    try:
        structured_llm = llm.with_structured_output(ParseTextResponse)

        result = structured_llm.invoke(
            f"Parse this {lang_hint} text into a financial transaction. "
            f"Today's date is {today}.\n\n"
            f'Text: "{body.text}"\n\n'
            "Rules:\n"
            '- Default type is "expense" unless words like "lương", '
            '"salary", "received", "nhận" indicate income\n'
            '- Extract amount (handle Vietnamese shortcuts: "50k" = 50000, '
            '"1tr" = 1000000, "1.5tr" = 1500000)\n'
            f"- Categorize into: {categories_list}\n"
            "- Description should be concise\n"
            "- Date: use today if not specified, otherwise parse relative "
            'dates like "hôm qua" (yesterday)\n'
            "- Return amount as a number (not string)\n"
            '- Use field name "transactionDate" for the date (not "date")\n'
            "- Respond in JSON format."
        )

        return cast(ParseTextResponse, result)

    except Exception as exc:
        logger.error("AI parse error: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to parse transaction", "redirect": "/transactions"},
        )
