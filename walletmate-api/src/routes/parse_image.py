"""Parse image endpoint — Groq vision-powered expense extraction from receipts."""

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
# Groq base64-encoded image limit is 4MB per request
MAX_IMAGE_SIZE = 4 * 1024 * 1024  # 4 MB


def _build_vision_prompt() -> str:
    """Build the vision prompt with current categories and date."""
    categories_list = ", ".join(f'"{c}"' for c in ALLOWED_CATEGORIES)
    today = date.today().isoformat()
    return (
        "Analyze this receipt/bill image and extract the transaction data.\n\n"
        "Rules:\n"
        "- Identify if this is an expense or income (default to expense)\n"
        "- Extract the total amount (handle Vietnamese formatting: dots for thousands, "
        "commas for decimals)\n"
        f"- Categorize into one of: {categories_list}\n"
        "- Write a concise description of what was purchased\n"
        f"- Extract the date if visible, otherwise use today's date ({today})\n"
        "- Handle Vietnamese text on receipts\n"
        "- Return amount as a number (not string)\n"
        '- Use field name "transactionDate" for the date in YYYY-MM-DD format\n'
        "- Respond in JSON format."
    )


@router.post("/api/parse-image", response_model=ParseResponse)
async def parse_image(image: UploadFile = File(...)) -> ParseResponse | JSONResponse:  # noqa: B008
    """Extract transaction data from a receipt/bill image using Groq vision."""
    # Check API key availability
    if not OPENAI_API_KEY:
        return JSONResponse(
            status_code=503,
            content={"error": "AI service not configured", "redirect": "/transactions"},
        )

    # Validate content type
    content_type = image.content_type or ""
    if content_type not in ALLOWED_MIME_TYPES:
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid image format. Accepted: JPEG, PNG, WebP, GIF"},
        )

    # Read and validate file size (Groq base64 limit: 4MB)
    contents = await image.read()
    if len(contents) > MAX_IMAGE_SIZE:
        return JSONResponse(
            status_code=400,
            content={"error": "Image too large (max 4MB)"},
        )

    # Encode image to base64
    base64_image = base64.b64encode(contents).decode("utf-8")
    mime_type = content_type  # already validated above

    # Call Groq vision model with LangChain structured output
    try:
        structured_llm = llm.with_structured_output(ParseResponse)

        message = HumanMessage(
            content=[
                {"type": "text", "text": _build_vision_prompt()},
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
