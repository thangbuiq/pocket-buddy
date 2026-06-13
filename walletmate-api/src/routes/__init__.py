"""Routes package for the Walletmate AI API."""

from .health import router as health_router
from .parse_image import router as parse_image_router
from .parse_text import router as parse_text_router

__all__ = [
    "health_router",
    "parse_text_router",
    "parse_image_router",
]
