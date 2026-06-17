"""Parse image endpoint - Groq vision-powered expense extraction from receipts."""

from __future__ import annotations

import base64
import logging
from datetime import date
from typing import cast

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
from langchain_core.messages import HumanMessage

from ..config import ALLOWED_CATEGORIES, OPENAI_API_KEY
from ..schemas import ParseResponse
from ..services.ai import llm

logger = logging.getLogger(__name__)

router = APIRouter()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE = 4 * 1024 * 1024  # 4 MB

PARSING_PROMPT = """\
You are a receipt/bill analyzer. Analyze this receipt/bill image and extract \
the transaction data.

Today's date: {today}
Valid categories: {categories_list}

RULES:

1. Transaction type:
   - Default to "expense"
   - Only set "income" when clearly a receipt voucher / money-in document

2. Amount:
   - Extract the FINAL TOTAL (TOTAL / THÀNH TIỀN / TỔNG CỘNG /...) from the receipt
   - Handle Vietnamese number formatting on receipts:
     + Dots (.) separate thousands: "150.000" = 150000
     + Commas (,) separate decimals: "50,5" = 50.5
     + Example: "1.500.000" = 1500000; "1.500.000,50" = 1500000.50
   - If the receipt includes tax/VAT, use the post-tax total (largest number, \
usually the grand total)
   - If multiple amounts exist, prioritize labels: "TOTAL", "TỔNG CỘNG", \
"THÀNH TIỀN", "PHẢI TRẢ", "THANH TOÁN"
   - Return amount as a number (float), never a string

3. Category:
   - Pick exactly ONE from: {categories_list}
   - Categorize by what was purchased:
     + Food, restaurants, cafe, bubble tea → "Ăn uống"
     + Taxi, Grab, fuel, bus tickets → "Di chuyển"
     + Clothing, household items, electronics → "Mua sắm"
     + Movies, karaoke, travel → "Giải trí"
     + Electricity, water, internet, rent → "Hóa đơn"
     + Medicine, hospital, clinic → "Sức khỏe"
     + Books, courses → "Học tập"
     + Payroll, receipt vouchers → "Lương"
   - Use "Khác" (Other) if uncertain

4. Description:
   - Concise, in Vietnamese
   - Mention the main items/service and shop name if legible
   - Example: "Ăn trưa tại Quán Ngon", "Đổ xăng Petrolimex 200k"

5. Transaction date (transactionDate):
   - Extract the date from the receipt if legible
   - Usually found near the header or footer of the receipt
   - If missing or illegible, use today: {today}
   - Format: YYYY-MM-DD
   - Field name in JSON: "transactionDate" (NOT "date")

Respond in JSON format."""


@router.post("/api/parse-image", response_model=ParseResponse)
async def parse_image(image: UploadFile = File(...)) -> ParseResponse | JSONResponse:  # noqa: B008
    """Extract transaction data from a receipt/bill image using Groq vision."""

    if not OPENAI_API_KEY:
        return JSONResponse(
            status_code=503,
            content={"error": "AI service not configured", "redirect": "/transactions"},
        )

    content_type = image.content_type or ""
    if content_type not in ALLOWED_MIME_TYPES:
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid image format. Accepted: JPEG, PNG, WebP, GIF"},
        )

    contents = await image.read()
    if len(contents) > MAX_IMAGE_SIZE:
        return JSONResponse(
            status_code=400,
            content={"error": "Image too large (max 4MB)"},
        )

    base64_image = base64.b64encode(contents).decode("utf-8")
    mime_type = content_type

    try:
        structured_llm = llm.with_structured_output(ParseResponse)

        prompt = PARSING_PROMPT.format(
            today=date.today().isoformat(),
            categories_list=", ".join(ALLOWED_CATEGORIES),
        )

        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{base64_image}"},
                },
            ]
        )

        result = structured_llm.invoke([message])
        return cast(ParseResponse, result)

    except Exception as exc:
        logger.error("AI image parse error: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to parse image", "redirect": "/transactions"},
        )
