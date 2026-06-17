"""Parse text endpoint - AI-powered expense extraction from text input."""

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

PARSING_PROMPT = """\
You are a financial transaction parser. Parse the following text into a \
structured JSON transaction.

Today's date: {today}
Input language: {lang_hint}
Valid categories: {categories_list}

Text to parse: "{text}"

RULES:

1. Transaction type:
   - Default to "expense"
   - Only set "income" if keywords present: lương, nhận, thưởng, thu nhập, \
kiếm được, tiền về, tiền vào, salary, received, income; or justify with context.

2. Amount - VIETNAMESE TEEN SLANG & SHORTHAND HANDLING:
   BASE UNITS:
   - "k" = thousand = 1,000 (e.g. "50k" = 50000)
   - "nghìn" / "ngàn" = 1,000
   - "tr" = triệu = 1,000,000 (e.g. "1tr" = 1000000)
   - "tỷ" / "tỉ" = 1,000,000,000

   SLANG FOR BILLION (1,000,000,000 VND):
   - tỏi (e.g. "2 tỏi" = 2000000000)

   SLANG FOR MILLION (1,000,000 VND):
   - triệu / trịu / trẹo (e.g. "5 trịu" = 5000000)
   - củ - nationwide, most common (e.g. "5 củ" = 5000000)
   - chai - southern region (e.g. "3 chai" = 3000000)
   - M - youth/online shorthand (e.g. "2M" = 2000000)

   SLANG FOR HUNDRED THOUSAND (100,000 VND):
   - lít / lốp / sọi - nationwide (e.g. "3 lít" = 300000, "5 lốp" = 500000)
   - trăm - when "2 trăm", "3 trăm" standalone (no "ngàn") means \
200000, 300000
     BUT "2 trăm nghìn" / "2 trăm ngàn" = 200000 (explicit)

   SLANG FOR TEN THOUSAND (10,000 VND):
   - xị / xịch - southern region (e.g. "5 xị" = 50000)
     NOTE: "5 xị" = 50000, "10 xị" = 100000 = "1 lít"

   SLANG FOR THOUSAND (1,000 VND):
   - cành (e.g. "5 cành" = 5000; "500 cành" = 500000 -
     scale depends on context)

   USD-BASED SLANG (exchange-rate dependent, ~25,000 VND per USD):
   - vé = 100 USD ≈ 2,500,000 VND (e.g. "1 vé" ≈ 2500000)
   - lá = 10,000 JPY ≈ 1,600,000 VND

   COMBINED & COMPOUND FORMS:
   - "1tr5" / "1.5tr" / "1tr rưỡi" = 1500000
   - "1củ2" / "1tr2" / "1tr200" = 1200000
   - "1tr rưởi" = 1500000 (alt spelling of rưỡi)
   - "nửa củ" / "nửa triệu" = 500000
   - "trăm rưỡi" / "trăm rưởi" = 150000
   - "2 lít rưỡi" = 250000
   - "1tr 200" = 1200000

   Return amount as a number (float), never a string.

3. Category:
   - Pick exactly ONE from: {categories_list}
   - Infer from the text content
   - Use "Khác" (Other) if uncertain

4. Description:
   - Concise, in the input language
   - Summarize the transaction, do not repeat raw text verbatim

5. Transaction date (transactionDate):
   - Default to today ({today}) if no specific date is mentioned
   - Handle Vietnamese relative date expressions:
     + "hôm nay" = today ({today})
     + "hôm qua" = yesterday
     + "hôm kia" = day before yesterday
     + "tuần trước" / "tuần vừa rồi" = 7 days ago
     + "tháng trước" = 1 month ago
     + "mai" / "ngày mai" = tomorrow
     + "thứ 2/3/4/5/6/7/CN tuần này" = specific day this week
   - Format: YYYY-MM-DD (string)
   - Field name in JSON: "transactionDate" (NOT "date")

Respond in JSON format."""


@router.post("/api/parse-text", response_model=ParseTextResponse)
def parse_text(body: ParseTextRequest) -> ParseTextResponse | JSONResponse:
    """Parse free-form text into a structured financial transaction."""

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

        prompt = PARSING_PROMPT.format(
            today=today,
            lang_hint=lang_hint,
            categories_list=categories_list,
            text=body.text,
        )
        result = structured_llm.invoke(prompt)

        return cast(ParseTextResponse, result)

    except Exception as exc:
        logger.error("AI parse error: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to parse transaction", "redirect": "/transactions"},
        )
