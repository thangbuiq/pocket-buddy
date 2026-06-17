# walletmate-pwa-app

Next.js 15 PWA frontend.

## Environment Variables

```bash
DATABASE_URL=postgresql://user:password@host/db
AUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Commands

```bash
bun install          # Install dependencies
bun dev              # Dev server (port 3000)
bun run build        # Production build
bun run lint         # ESLint
```

## Structure

```
app/                  # Next.js routes & API
components/           # React components
  charts/            # CategoryBreakdown, MonthlyTrendChart
  forms/             # AddTransactionSheet
  shared/            # SmartInput, Sidebar, TransactionCard
db/                  # Drizzle schema
features/            # Feature modules
hooks/               # Custom hooks
lib/                 # Utilities, i18n, auth
types/               # TypeScript types
```

## Key Files

- `components/shared/SmartInput.tsx` - AI text/image input
- `lib/api.ts` - Python backend API client
- `lib/i18n/translations.ts` - Vietnamese/English strings
- `app/(dashboard)/dashboard/page.tsx` - Main dashboard
