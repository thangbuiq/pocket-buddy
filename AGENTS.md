# AGENTS.md

## Repo layout

Monorepo with two apps:

- `walletmate-api/` - Python 3.12 FastAPI backend (AI expense/income parsing)
- `walletmate-pwa-app/` - Next.js 15 PWA frontend (TypeScript, Bun)

Root `pyproject.toml` defines a `uv` workspace with `walletmate-api` as the only member.

## Commands

### Setup

```bash
just setup        # uv sync (api) + bun install (pwa)
pre-commit install
```

### Dev servers

```bash
just all          # runs both API (:8000) and UI (:3000) concurrently
just api          # API only
just ui           # UI only
```

### Backend (`walletmate-api/`)

```bash
uv run uvicorn src.main:app --reload   # dev server
uv run ruff check .                    # lint
uv run ruff format .                   # format
uv run mypy src/                       # type check
```

### Frontend (`walletmate-pwa-app/`)

```bash
bun dev           # dev server (port 3000)
bun run build     # production build
bun run lint      # eslint
```

### Pre-commit

```bash
pre-commit run --all-files
```

Runs: trailing-whitespace, end-of-file-fixer, ruff check+format (api), mypy (api src), eslint+prettier (pwa).

## Backend conventions

- Entry points: `src/main.py` (dev), `api/index.py` (Vercel serverless - imports `src.main:app`)
- Docs at `/swagger` (not `/docs`)
- Validation errors return HTTP 400 (not 422) - custom exception handler in `src/main.py`
- CORS allows `localhost:3000` and `walletmate.vercel.app`
- Uses LangChain + OpenAI (`gpt-4o-mini`) for AI parsing
- Categories are in Vietnamese (see `src/config.py`)
- mypy config lives in `walletmate-api/pyproject.toml`

## Frontend conventions

- Package manager: **Bun** (not npm/yarn/pnpm)
- Path alias: `@/*` → `./*` (see `tsconfig.json`)
- DB: Drizzle ORM + Neon PostgreSQL serverless (`@neondatabase/serverless`)
- Auth: NextAuth v5 (beta) - GitHub OAuth + demo credentials provider
- PWA: Serwist (`@serwist/next`) - `public/sw.js` is generated (gitignored)
- i18n: Vietnamese & English (`lib/i18n/translations.ts`)
- Offline-first: `lib/offline/queue.ts` for pending mutations
- Tailwind CSS v4 with `@tailwindcss/postcss`
- Strict TypeScript, `noEmit`

## Deployment

Both apps deploy to Vercel on merge to `main`:

- API: `walletmate-api/vercel.json` → `api/index.py`
- PWA: `walletmate-pwa-app/vercel.json` → Next.js build

## Environment

`.env` files are gitignored. Copy from `.env.example`:

- `walletmate-api/.env` - `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`
- `walletmate-pwa-app/.env` - `DATABASE_URL`, `AUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`, `NEXT_PUBLIC_API_URL`

## Testing

No test suite exists yet. Backend has pytest in dev deps (`walletmate-api/pyproject.toml`), testpaths configured as `tests/`.
