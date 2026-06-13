# walletmate-api

Python FastAPI backend for AI expense parsing.

## Environment Variables

```bash
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

## Commands

```bash
uv sync                                    # Install dependencies
uv run uvicorn src.main:app --reload       # Dev server (port 8000)
uv run ruff check .                        # Lint
uv run ruff format .                       # Format
uv run mypy src/                           # Type check
```

## API Endpoints

```
GET  /health              → {"status": "ok"}
POST /api/parse-text      → Parse text to transaction
POST /api/parse-image     → Parse receipt image to transaction
```

Both parse endpoints return:
```json
{
  "type": "expense|income",
  "amount": 50000,
  "category": "Ăn uống",
  "description": "Cà phê",
  "transactionDate": "2026-06-13"
}
```

## Structure

```
api/index.py           # Vercel entry point
src/
  main.py             # FastAPI app
  config.py           # Constants, categories
  schemas.py          # Pydantic models
  services/ai.py      # OpenAI client
  routes/
    health.py         # GET /health
    parse_text.py     # POST /api/parse-text
    parse_image.py    # POST /api/parse-image
```

## Categories

Ăn uống, Di chuyển, Mua sắm, Giải trí, Hóa đơn, Sức khỏe, Học tập, Lương, Khác
