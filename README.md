# Pocket Buddy

AI-powered personal finance PWA.

## Quick Start

```bash
bun install

cp .env.example .env

# Fill in .env
bun dev
```

Open http://localhost:3000

## Database

```bash
bunx drizzle-kit generate
bunx drizzle-kit push
```

## Environment Variables

See `.env.example` for required variables.

## Tech Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS v4
- Auth.js v5
- Drizzle ORM + Neon Postgres
- Vercel AI SDK
- Serwist PWA

## Project Structure

```
app/          # Next.js App Router pages
components/   # React components
lib/          # Utilities and shared logic
db/           # Database schema
hooks/        # React hooks
features/     # Feature modules
types/        # TypeScript types
public/       # Static assets
```
