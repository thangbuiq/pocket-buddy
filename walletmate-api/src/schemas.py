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


class ParseBatchResponse(BaseModel):
    """Structured transactions returned by the batch file parser."""

    transactions: list[ParseResponse] = Field(default_factory=list, max_length=100)


class HistoricalTransaction(BaseModel):
    """A lightweight transaction record used for recurring suggestion context."""

    type: Literal["expense", "income"]
    amount: float = Field(..., gt=0)
    category: str
    description: str
    transactionDate: str  # noqa: N815


class AnalyzeRequest(BaseModel):
    """Incoming payload for the AI insights endpoint."""

    transactions: list[HistoricalTransaction] = Field(default_factory=list)
    language: Literal["vi", "en"] = "vi"
    period_days: int = Field(default=30, ge=7, le=365)


class AnalyzeInsight(BaseModel):
    """A single proactive insight returned by the AI."""

    type: Literal["trend", "anomaly", "savings", "recurring", "budget"]
    title: str
    description: str
    severity: Literal["info", "warning", "success"] = "info"
    category: str | None = None
    amount_impact: float | None = None  # noqa: N815


class AnalyzeResponse(BaseModel):
    """Collection of proactive insights for the dashboard."""

    insights: list[AnalyzeInsight] = Field(default_factory=list)
