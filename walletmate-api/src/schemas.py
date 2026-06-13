"""Pydantic schemas for request/response validation."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ParseTextRequest(BaseModel):
    """Incoming payload for the text-parsing endpoint."""

    text: str = Field(..., min_length=1, max_length=500)
    language: Literal["vi", "en"] = "vi"


class ParseResponse(BaseModel):
    """Structured transaction returned by the AI parser (text and image)."""

    type: Literal["expense", "income"]
    amount: float = Field(..., gt=0)
    category: str
    description: str
    transactionDate: str  # noqa: N815


# Alias for backward-compatibility with text-specific naming
ParseTextResponse = ParseResponse
