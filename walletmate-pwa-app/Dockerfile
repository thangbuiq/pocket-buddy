FROM oven/bun:1.3.12-alpine AS deps

WORKDIR /app
ENV NODE_ENV=development
COPY walletmate-pwa-app/package.json walletmate-pwa-app/bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.3.12-alpine AS builder

WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG API_URL=http://localhost:8000
ARG AUTH_SECRET=docker-build-secret
ARG AUTH_URL=http://localhost:3000
ARG DATABASE_URL=postgresql://walletmate:walletmate@postgres:5432/walletmate
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    API_URL=${API_URL} \
    AUTH_SECRET=${AUTH_SECRET} \
    AUTH_URL=${AUTH_URL} \
    DATABASE_URL=${DATABASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY walletmate-pwa-app .
RUN bun run build

FROM oven/bun:1.3.12-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder --chown=app:app /app ./

USER app

EXPOSE 3000

CMD ["bun", "run", "start"]
