#!/usr/bin/env bash
# LivingHope Platform — Comprehensive Healthcheck Script
# Verifies database readiness and application HTTP /api/health endpoint

set -euo pipefail

APP_URL="${1:-http://127.0.0.1:3010/api/health}"

echo "Checking application health at ${APP_URL}..."

if command -v curl >/dev/null 2>&1; then
  HTTP_STATUS=$(curl -s -o /tmp/health_response.json -w "%{http_code}" "${APP_URL}" || echo "000")
elif command -v wget >/dev/null 2>&1; then
  HTTP_STATUS=$(wget -q -O /tmp/health_response.json --server-response "${APP_URL}" 2>&1 | awk '/HTTP\// {print $2}' | tail -1 || echo "000")
else
  echo "Error: Neither curl nor wget is installed." >&2
  exit 1
fi

if [ "${HTTP_STATUS}" -eq 200 ]; then
  echo "✓ Application healthcheck PASSED (HTTP 200):"
  cat /tmp/health_response.json
  echo ""
  exit 0
else
  echo "✗ Application healthcheck FAILED with HTTP ${HTTP_STATUS}:"
  cat /tmp/health_response.json 2>/dev/null || true
  echo ""
  exit 1
fi

