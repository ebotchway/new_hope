#!/usr/bin/env bash
# LivingHope Platform — PostgreSQL Restore Script
# Usage: ./scripts/restore-db.sh <backup_file.sql.gz> [target_db_container]

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path_to_backup.sql.gz> [container_name]" >&2
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="${2:-$(docker ps --filter "name=db" --format "{{.Names}}" | head -n 1)}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file '${BACKUP_FILE}' not found." >&2
  exit 1
fi

if [ -z "${CONTAINER_NAME}" ]; then
  echo "Error: Target database container not found." >&2
  exit 1
fi

echo "=========================================="
echo "LivingHope Database Restoration"
echo "Source File: ${BACKUP_FILE}"
echo "Target Container: ${CONTAINER_NAME}"
echo "=========================================="

echo "Restoring database from compressed archive..."
gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U livinghope -d livinghope

echo "✓ Database restoration completed successfully."

