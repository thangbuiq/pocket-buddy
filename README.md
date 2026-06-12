# Pocket Buddy

Pocket Buddy is a modern AI-powered personal finance PWA built with Next.js 15, TypeScript, Tailwind CSS v4, Auth.js v5, Drizzle ORM, Neon, and the Vercel AI SDK.

## Features (MVP)

- Auth.js v5 setup (Google OAuth + credentials)
- Protected routes via middleware
- Dashboard, transactions, budgets, goals, analytics, assistant, settings pages
- Transaction + budget API handlers with Zod validation
- AI insights API and assistant API with per-user daily rate limiting
- Serwist PWA setup with `manifest.ts` and service worker
- Offline transaction queue via IndexedDB (`idb`)
- Drizzle schema files for users/sessions/transactions/budgets/goals/insights/AI tables
- TanStack Query hooks and reusable UI components

## Tech stack

- Next.js 15 (App Router) + React 19
- TypeScript 5
- Tailwind CSS v4
- Auth.js v5 (`next-auth@beta`)
- Drizzle ORM + Drizzle Kit
- Neon serverless Postgres driver
- Vercel AI SDK + OpenAI `gpt-4o-mini`
- Serwist PWA
- Recharts, Zustand, React Hook Form, Zod, Lucide

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment template:

```bash
cp .env.example .env.local
```

3. Fill required variables in `.env.local`.

4. Run development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Database (Drizzle)

Generate migrations:

```bash
npx drizzle-kit generate
```

Apply migrations:

```bash
npx drizzle-kit migrate
```

## Deployment (Vercel + Neon)

1. Create a Neon database and copy connection string to `DATABASE_URL`.
2. Add all `.env.example` variables in Vercel project settings.
3. Deploy from GitHub to Vercel.
4. Run Drizzle migrations against production database.

## PWA notes

- Manifest: `src/app/manifest.ts`
- Service worker source: `src/app/sw.ts`
- Generated service worker target: `public/sw.js`
- Offline queue implementation: `src/lib/offline/queue.ts`
