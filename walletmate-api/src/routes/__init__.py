"""Routes package for the walletmate AI API."""

from .analyze import router as analyze_router
from .health import router as health_router
from .parse_batch import router as parse_batch_router
from .parse_image import router as parse_image_router
from .parse_text import router as parse_text_router

__all__ = [
    "health_router",
    "parse_batch_router",
    "parse_text_router",
    "parse_image_router",
    "analyze_router",
]
