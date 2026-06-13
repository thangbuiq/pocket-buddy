setup:
    cd walletmate-api && uv sync --all-groups --all-extras --all-packages
    cd walletmate-pwa-app && bun install

api:
    cd walletmate-api && uv run uvicorn src.main:app --host 0.0.0.0 --reload

ui:
    cd walletmate-pwa-app && bun dev

all:
    #!/usr/bin/env bash
    set -e

    trap 'kill 0' INT TERM EXIT

    just api &
    just ui &

    wait
