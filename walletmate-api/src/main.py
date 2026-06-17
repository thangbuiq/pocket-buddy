"""FastAPI app for AI-powered expense and income parsing."""

from __future__ import annotations

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import APP_TITLE
from .routes import (
    analyze_router,
    health_router,
    parse_image_router,
    parse_text_router,
    suggest_recurring_router,
)

load_dotenv()

app = FastAPI(
    title=APP_TITLE,
    host="0.0.0.0",
    docs_url="/swagger",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://walletmate.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(parse_text_router)
app.include_router(parse_image_router)
app.include_router(suggest_recurring_router)
app.include_router(analyze_router)


@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Return 400 (not 422) for request validation errors."""
    return JSONResponse(status_code=400, content={"error": "Invalid request"})
