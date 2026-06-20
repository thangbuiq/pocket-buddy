"""Health-check endpoint."""

from datetime import UTC, datetime

from fastapi import APIRouter

router = APIRouter()


@router.get("/api/health")
def health() -> dict[str, str]:
    """Liveness check endpoint."""
    return {"status": "ok", "timestamp": datetime.now(UTC).isoformat()}
