"""LangChain chat model initialization with environment-based configuration."""

from __future__ import annotations

from langchain_openai import ChatOpenAI
from pydantic import SecretStr

from ..config import OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL

# Use a placeholder key when not configured - endpoints guard with their own
# 503 response before any API call is made.
llm = ChatOpenAI(
    model=OPENAI_MODEL,
    api_key=SecretStr(OPENAI_API_KEY or "not-configured"),
    base_url=OPENAI_BASE_URL,
)
