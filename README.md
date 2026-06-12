# Pocket Buddy

```bash
bun install
cp .env.example .env
bun dev
```

## Database

### Initial setup

Push schema to create all tables:

```bash
bunx drizzle-kit push
```

### Update schema

When you modify `db/schema/*.ts`:

1. Generate migration SQL:
   ```bash
   bunx drizzle-kit generate
   ```

2. Apply migrations to database:
   ```bash
   bunx drizzle-kit migrate
   ```

Or do both in one command:
```bash
bunx drizzle-kit generate && bunx drizzle-kit migrate
```
