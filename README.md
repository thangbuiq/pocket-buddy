<div align="center">

# walletmate

[![CI](https://github.com/thangbuiq/walletmate/actions/workflows/ci.yml/badge.svg)](https://github.com/thangbuiq/walletmate/actions/workflows/ci.yml)
[![Prek](https://github.com/thangbuiq/walletmate/actions/workflows/prek.yml/badge.svg)](https://github.com/thangbuiq/walletmate/actions/workflows/prek.yml)

> Tired of typing out every coffee or meal you buy? `walletmate` makes tracking your spending easy. Just take a picture of your receipt or type something like "bought coffee 50k today" and our AI will do the rest.

<table>
<tr>
<td>
Load your transactions
</td>
<td>
Get personalized insights
</td>
</tr>
<tr>
<td width="44%" valign="top">
<img src="assets/app-ui.png" width="100%" />
</td>
<td width="56%" valign="top">
<img src="assets/analytics.png" width="100%" />
</td>
</tr>
</table>

</div>

`walletmate` will also give you daily advice on how to save money, automatic tracking of your regular bills, and an app that works perfectly even without internet.

## Why use walletmate

- **Smart input**: easy receipt scan with AI or natural text input.
- **Daily spending advice**: get simple tips on how to manage your money better.
- **Smart bill detection**: we find out what bills you pay regularly.

## See Smart Input in Action

- Image Parsing: (receipt scan)

    <table>
    <tr>
        <td>
        <strong>Snap a receipt</strong>
        </td>
        <td>
        <strong>AI will auto parse the image</strong>
        </td>
    </tr>
    <tr>
        <td width="50%" valign="top">
        <img src="assets/example-check.jpeg" width="100%" />
        </td>
        <td width="50%" valign="top">
        <img src="assets/example-check-result.jpeg" width="80%" />
        </td>
    </tr>
    </table>

- Text Parsing (from natural language):

    **Input:**

    ```text
    bought coffee 50k today
    ```

    **Output:**

    ```json
    {
        "type": "expense",
        "amount": 50000,
        "category": "Ăn uống",
        "description": "Cà phê sáng",
        "transactionDate": "2026-06-20"
    }
    ```

## Development

### Structure

```
walletmate/
├── walletmate-pwa-app/    # Next.js PWA frontend
└── walletmate-api/        # Python FastAPI backend
```

### Apps

#### Frontend (walletmate-pwa-app)

Next.js 15 Progressive Web App with:
- AI-powered expense/income parsing (text & image)
- Dark/light theme support
- Vietnamese & English localization
- Offline-first PWA capabilities

**Tech stack:** Next.js, React, TypeScript, Tailwind CSS, TanStack Query

#### Backend (walletmate-api)

Python FastAPI service providing:
- Text parsing endpoint (`POST /api/parse-text`)
- Image parsing endpoint (`POST /api/parse-image`)
- OpenAI GPT-4o-mini integration

**Tech stack:** Python 3.12, FastAPI, OpenAI SDK, Pydantic

### Prerequisites

- Node.js 20+ and Bun
- Python 3.12+ and uv

## One-command Docker deployment

Use this when you want to run the whole stack locally or on your own server:

- `postgres`: local PostgreSQL database
- `api`: FastAPI AI parsing backend on port `8000`
- `pwa`: Next.js PWA on port `3000`

### 1. Create the Docker env file

```bash
cp docker.env.example .env
openssl rand -base64 32
```

Paste the generated secret into `AUTH_SECRET` in `.env`, then set `OPENAI_API_KEY`.

For local Docker, the default URLs work:

```env
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000
API_URL=http://api:8000
```

For a server, change the public URLs to your domain:

```env
AUTH_URL=https://walletmate.example.com
NEXT_PUBLIC_API_URL=https://walletmate-api.example.com
CORS_ORIGINS=https://walletmate.example.com
API_URL=http://api:8000
```

`NEXT_PUBLIC_API_URL` must be reachable from users' browsers. `API_URL` is internal to Docker and should normally stay `http://api:8000`.

### 2. Start everything

```bash
docker compose up --build
```

Open:

- App: http://localhost:3000
- API health: http://localhost:8000/api/health
- API docs: http://localhost:8000/swagger

The PWA container runs `bun run db:push` on startup, so the local Postgres tables are created automatically.

### Common Docker commands

```bash
docker compose up -d --build     # start in background
docker compose logs -f           # follow logs
docker compose down              # stop containers
docker compose down -v           # stop and delete local database volume
```

### GitHub login on Docker

The demo login works without GitHub OAuth. To enable GitHub login, create an OAuth app at GitHub Developer Settings and set:

```env
GITHUB_ID=...
GITHUB_SECRET=...
AUTH_URL=http://localhost:3000
```

For a server, set the GitHub OAuth callback URL to:

```text
https://walletmate.example.com/api/auth/callback/github
```

### Setup

```bash
# Frontend
cd walletmate-pwa-app
bun install
cp .env.example .env  # Configure your environment variables

# Backend
cd walletmate-api
uv sync
cp .env.example .env  # Add your OPENAI_API_KEY
```

### Running Locally

```bash
# Frontend (port 3000)
cd walletmate-pwa-app
bun dev

# Backend (port 8000)
cd walletmate-api
uv run uvicorn src.main:app --reload
```

### Pre-commit Hooks

This project uses [pre-commit](https://pre-commit.com/) for code quality:

```bash
# Install pre-commit
pip install pre-commit
# or
brew install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### Deployment

All apps will be deployed on Vercel automatically after each merge to main branch.

![deployment](./assets/deployment.png)
