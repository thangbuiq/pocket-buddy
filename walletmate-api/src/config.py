"""Application-wide constants and environment helpers."""

from __future__ import annotations

import os

APP_TITLE = "walletmate AI API"

ALLOWED_CATEGORIES = [
    "Ăn uống",
    "Di chuyển",
    "Mua sắm",
    "Giải trí",
    "Hóa đơn",
    "Sức khỏe",
    "Học tập",
    "Lương",
    "Khác",
]

# OpenAI-compatible model configuration (text + vision parsing)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def require_env(name: str) -> str:
    """Return a required environment variable or raise ``RuntimeError``."""
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing environment variable: {name}")
    return value
