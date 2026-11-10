#!/usr/bin/env bash
# LivingHope Platform — Automated PostgreSQL Backup Script
# Usage: ./scripts/backup-db.sh [backup_dir]

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/livinghope_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "=========================================="
echo "LivingHope Database Backup"
echo "Target File: ${BACKUP_FILE}"
echo "=========================================="

CONTAINER_NAME=$(docker ps --filter "name=db" --format "{{.Names}}" | head -n 1)

if [ -z "${CONTAINER_NAME}" ]; then
  echo "Error: No running PostgreSQL container found matching 'db'." >&2
  exit 1
fi

echo "Extracting database dump from container '${CONTAINER_NAME}'..."
docker exec -t "${CONTAINER_NAME}" pg_dump -U livinghope -d livinghope --clean --if-exists | gzip > "${BACKUP_FILE}"

if [ -s "${BACKUP_FILE}" ]; then
  FILESIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
  echo "✓ Backup successfully created: ${BACKUP_FILE} (${FILESIZE})"
else
  echo "✗ Error: Backup file was created empty." >&2
  rm -f "${BACKUP_FILE}"
  exit 1
fi

