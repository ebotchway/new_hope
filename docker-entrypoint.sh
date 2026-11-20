#!/bin/sh
set -e

# Ensure uploads, backups, and Next.js cache directories exist
mkdir -p /app/public/uploads /app/backups /app/.next/cache

# If default uploads exist in image, copy missing files over to uploads mount
if [ -d /app/public-defaults/uploads ]; then
  cp -rn /app/public-defaults/uploads/* /app/public/uploads/ 2>/dev/null || true
fi

# Fix ownership and permissions for non-root nextjs user
chown -R nextjs:nodejs /app/public/uploads /app/backups /app/.next/cache 2>/dev/null || true
chmod -R 775 /app/public/uploads /app/backups 2>/dev/null || true

# If running database migrations on startup
if [ "${RUN_MIGRATIONS_ON_STARTUP:-false}" = "true" ]; then
  echo "Running database migrations on startup..."
  su-exec nextjs node scripts/deploy-database.mjs
fi

# Execute process as nextjs user
exec su-exec nextjs "$@"
