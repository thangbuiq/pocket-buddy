# Pocket Buddy

AI-powered personal finance PWA.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in .env.local
npm run dev
```

Open http://localhost:3000

## Database

```bash
npx drizzle-kit generate
npx drizzle-kit push
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
