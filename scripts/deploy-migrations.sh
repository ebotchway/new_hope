#!/usr/bin/env bash
# LivingHope Platform — Controlled One-Time Database Migration Runner
#
# PURPOSE:
# Decouples database schema migrations from web application container startup.
# In production, prevents multiple scaled web containers from concurrently attempting
# schema migrations, which causes locks, race conditions, or migration failures.
#
# Usage:
#   ./scripts/deploy-migrations.sh [--container <app_container>]

set -euo pipefail

CONTAINER_NAME="${1:-}"

if [ -z "${CONTAINER_NAME}" ]; then
  CONTAINER_NAME=$(docker ps --filter "name=app" --format "{{.Names}}" | head -n 1)
fi

echo "============================================================"
echo "LivingHope Production Database Migration Runner"
echo "Target Runner Container: ${CONTAINER_NAME:-Local/Dedicated}"
echo "============================================================"

if [ -n "${CONTAINER_NAME}" ]; then
  echo "[1/3] Executing 'prisma migrate deploy' inside container '${CONTAINER_NAME}'..."
  docker exec -i "${CONTAINER_NAME}" npx prisma migrate deploy
else
  echo "[1/3] Executing 'prisma migrate deploy' in local runner environment..."
  npx prisma migrate deploy
fi

echo "[2/3] Checking migration status..."
if [ -n "${CONTAINER_NAME}" ]; then
  docker exec -i "${CONTAINER_NAME}" npx prisma migrate status
else
  npx prisma migrate status
fi

echo "[3/3] Migration verification complete."
echo "============================================================"
echo "✓ Schema migrations deployed successfully."
echo "============================================================"

