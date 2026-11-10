#!/usr/bin/env bash
# LivingHope Platform — Hardened PostgreSQL Backup Script
# Usage: ./scripts/backup-db.sh [--dir <backup_dir>] [--retention-days <days>] [--include-media]
#
# Features:
# 1. Non-interactive binary stream extraction (no terminal carriage returns)
# 2. Strict pipefail verification
# 3. Post-backup archive integrity test (gzip -t)
# 4. Optional automated retention cleanup
# 5. Optional media backup inclusion

set -euo pipefail

BACKUP_DIR="./backups"
RETENTION_DAYS=0
INCLUDE_MEDIA=false
CONTAINER_NAME=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dir)
      BACKUP_DIR="$2"
      shift 2
      ;;
    --retention-days)
      RETENTION_DAYS="$2"
      shift 2
      ;;
    --include-media)
      INCLUDE_MEDIA=true
      shift
      ;;
    --container)
      CONTAINER_NAME="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 [--dir <backup_dir>] [--retention-days <days>] [--include-media] [--container <name>]" >&2
      exit 1
      ;;
  esac
done

mkdir -p "${BACKUP_DIR}"

if [ -z "${CONTAINER_NAME}" ]; then
  CONTAINER_NAME=$(docker ps --filter "name=db" --format "{{.Names}}" | head -n 1)
fi

if [ -z "${CONTAINER_NAME}" ]; then
  echo "[-] Error: No running PostgreSQL container found matching 'db'." >&2
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/livinghope_db_${TIMESTAMP}.sql.gz"

echo "============================================================"
echo "LivingHope Production Database Backup"
echo "Target Container: ${CONTAINER_NAME}"
echo "Output Archive:   ${BACKUP_FILE}"
echo "Timestamp:        ${TIMESTAMP}"
echo "============================================================"

# Verify container is ready to accept commands
if ! docker exec -i "${CONTAINER_NAME}" pg_isready -U livinghope > /dev/null 2>&1; then
  echo "[-] Error: PostgreSQL container '${CONTAINER_NAME}' is not responding to pg_isready." >&2
  exit 1
fi

echo "[1/3] Streaming PostgreSQL database dump..."
# Note: Use -i (interactive stdin), DO NOT use -t (tty) to avoid injecting Windows-style CRLF into binary stream
docker exec -i "${CONTAINER_NAME}" pg_dump -U livinghope -d livinghope --clean --if-exists --no-owner --no-privileges | gzip -9 > "${BACKUP_FILE}"

echo "[2/3] Validating backup archive integrity..."
if [ ! -s "${BACKUP_FILE}" ]; then
  echo "[-] Error: Backup file '${BACKUP_FILE}' was created empty or missing." >&2
  rm -f "${BACKUP_FILE}"
  exit 1
fi

if ! gzip -t "${BACKUP_FILE}"; then
  echo "[-] Error: Backup file failed gzip integrity validation check." >&2
  rm -f "${BACKUP_FILE}"
  exit 1
fi

FILESIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
echo "[+] Database backup verified successfully: ${BACKUP_FILE} (${FILESIZE})"

# Optional Media backup
if [ "${INCLUDE_MEDIA}" = true ]; then
  MEDIA_BACKUP_FILE="${BACKUP_DIR}/livinghope_media_${TIMESTAMP}.tar.gz"
  echo "[3/3] Backing up media uploads and site images..."
  if [ -d "public/uploads" ] || [ -d "public/images" ]; then
    tar -czf "${MEDIA_BACKUP_FILE}" -C public uploads images
    echo "[+] Media backup created: ${MEDIA_BACKUP_FILE}"
  else
    echo "[*] Notice: public directories do not exist locally; checking container uploads..."
    APP_CONTAINER=$(docker ps --filter "name=app" --format "{{.Names}}" | head -n 1)
    if [ -n "${APP_CONTAINER}" ]; then
      docker exec -i "${APP_CONTAINER}" tar -czf - -C /app/public uploads images > "${MEDIA_BACKUP_FILE}" 2>/dev/null || true
      if [ -s "${MEDIA_BACKUP_FILE}" ]; then
        echo "[+] Media backup extracted from container: ${MEDIA_BACKUP_FILE}"
      else
        rm -f "${MEDIA_BACKUP_FILE}"
        echo "[*] Notice: No container media files found to back up."
      fi
    fi
  fi
else
  echo "[3/3] Media backup skipped (use --include-media to include)."
fi

# Retention policy enforcement
if [ "${RETENTION_DAYS}" -gt 0 ]; then
  echo "[*] Enforcing retention policy: deleting backups older than ${RETENTION_DAYS} days in ${BACKUP_DIR}..."
  find "${BACKUP_DIR}" -name "livinghope_*.gz" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} +
  echo "[+] Retention policy applied."
fi

echo "============================================================"
echo "✓ Backup operation completed successfully."
echo "============================================================"
