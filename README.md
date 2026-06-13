# Walletmate

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

## Create User

To create a new user for testing or development:

```bash
bun run scripts/create-user.ts --email=user@example.com --password=yourpassword
```

Optional parameters:
- `--name=John Doe` - Set user's display name
- `--currency=USD` - Set default currency (default: USD)
- `--timezone=UTC` - Set timezone (default: UTC)

Example with all options:
```bash
bun run scripts/create-user.ts \
  --email=john@example.com \
  --password=securepass123 \
  --name="John Doe" \
  --currency=EUR \
  --timezone=Europe/Berlin
```
