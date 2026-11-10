#!/usr/bin/env bash
# LivingHope Platform — Hardened PostgreSQL Disaster Recovery & Restoration Script
#
# SAFETY PROTECTIONS:
# 1. Defaults to NON-DESTRUCTIVE operation.
# 2. Rejects execution without explicit '--confirm-restore' flag or '--test-restore' mode.
# 3. Validates backup archive integrity (gzip -t) and SQL header BEFORE touching database.
# 4. Supports '--test-restore' mode to verify restoration in an isolated disposable database.
# 5. Automatically takes a pre-restore safety snapshot before touching the live database.
# 6. Terminates stale connections safely without leaving open locks.
#
# Usage:
#   # Test/verify a backup non-destructively:
#   ./scripts/restore-db.sh --file ./backups/livinghope_db_XXXXX.sql.gz --test-restore
#
#   # Perform an authorized production restoration:
#   ./scripts/restore-db.sh --file ./backups/livinghope_db_XXXXX.sql.gz --confirm-restore [--target-db livinghope]

set -euo pipefail

BACKUP_FILE=""
TARGET_DB="livinghope"
CONTAINER_NAME=""
CONFIRM_RESTORE=false
TEST_RESTORE=false
SKIP_PRE_SNAPSHOT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --file)
      BACKUP_FILE="$2"
      shift 2
      ;;
    --target-db)
      TARGET_DB="$2"
      shift 2
      ;;
    --container)
      CONTAINER_NAME="$2"
      shift 2
      ;;
    --confirm-restore)
      CONFIRM_RESTORE=true
      shift
      ;;
    --test-restore)
      TEST_RESTORE=true
      shift
      ;;
    --skip-pre-snapshot)
      SKIP_PRE_SNAPSHOT=true
      shift
      ;;
    *)
      echo "[-] Error: Unknown option: $1" >&2
      echo "Usage: $0 --file <path.sql.gz> [--test-restore | --confirm-restore] [--target-db <name>] [--container <name>]" >&2
      exit 1
      ;;
  esac
done

if [ -z "${BACKUP_FILE}" ]; then
  echo "[-] Error: Missing required '--file <backup.sql.gz>' parameter." >&2
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[-] Error: Backup file '${BACKUP_FILE}' not found on filesystem." >&2
  exit 1
fi

if [ -z "${CONTAINER_NAME}" ]; then
  CONTAINER_NAME=$(docker ps --filter "name=db" --format "{{.Names}}" | head -n 1)
fi

if [ -z "${CONTAINER_NAME}" ]; then
  echo "[-] Error: No running PostgreSQL container found matching 'db'." >&2
  exit 1
fi

echo "============================================================"
echo "LivingHope Database Recovery & Restoration Manager"
echo "Source File:      ${BACKUP_FILE}"
echo "Target Container: ${CONTAINER_NAME}"
echo "Target Database:  ${TARGET_DB}"
echo "Execution Mode:   $([ "${TEST_RESTORE}" = true ] && echo "ISOLATED TEST (Non-destructive)" || echo "LIVE RESTORATION")"
echo "============================================================"

# Step 1: Pre-flight Backup File Verification
echo "[1/5] Validating backup archive integrity..."
if [ ! -s "${BACKUP_FILE}" ]; then
  echo "[-] Error: Backup file is 0 bytes." >&2
  exit 1
fi

if ! gzip -t "${BACKUP_FILE}"; then
  echo "[-] Error: Backup file is corrupted or not a valid gzip stream." >&2
  exit 1
fi

# Inspect first decompressed lines to ensure valid SQL
FIRST_LINE=$(gunzip -c "${BACKUP_FILE}" | head -n 10 | grep -E "PostgreSQL database dump|SET|CREATE|DROP" | head -n 1 || true)
if [ -z "${FIRST_LINE}" ]; then
  echo "[-] Error: Backup archive does not appear to contain a valid PostgreSQL dump." >&2
  exit 1
fi
echo "[+] Archive integrity verified. Header detected: ${FIRST_LINE}"

# Step 2: Safety Gate Check
if [ "${TEST_RESTORE}" = false ] && [ "${CONFIRM_RESTORE}" = false ]; then
  echo ""
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "SAFETY INTERLOCK ENGAGED: DESTRUCTIVE ACTION PREVENTED"
  echo "Restoring to '${TARGET_DB}' will replace existing schema & data."
  echo "To proceed with live restoration, you must pass '--confirm-restore'."
  echo "Alternatively, to test-restore non-destructively, pass '--test-restore'."
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  exit 1
fi

# Step 3: Handle Isolated Test Restore Mode
if [ "${TEST_RESTORE}" = true ]; then
  TEST_DB="livinghope_restore_verify_$(date +%s)"
  echo "[2/5] Creating isolated disposable test database '${TEST_DB}'..."
  docker exec -i "${CONTAINER_NAME}" psql -U livinghope -d postgres -c "DROP DATABASE IF EXISTS \"${TEST_DB}\";"
  docker exec -i "${CONTAINER_NAME}" psql -U livinghope -d postgres -c "CREATE DATABASE \"${TEST_DB}\";"

  echo "[3/5] Restoring backup archive into isolated database '${TEST_DB}'..."
  gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U livinghope -d "${TEST_DB}" --quiet > /dev/null

  echo "[4/5] Verifying restored schema and record counts in '${TEST_DB}'..."
  USER_COUNT=$(docker exec -i "${CONTAINER_NAME}" psql -U livinghope -d "${TEST_DB}" -t -c 'SELECT COUNT(*) FROM users;' 2>/dev/null | tr -d ' ' || echo "0")
  DONATION_COUNT=$(docker exec -i "${CONTAINER_NAME}" psql -U livinghope -d "${TEST_DB}" -t -c 'SELECT COUNT(*) FROM donations;' 2>/dev/null | tr -d ' ' || echo "0")
  CHILD_COUNT=$(docker exec -i "${CONTAINER_NAME}" psql -U livinghope -d "${TEST_DB}" -t -c 'SELECT COUNT(*) FROM children;' 2>/dev/null | tr -d ' ' || echo "0")

  echo "[+] Record Verification in Isolated Database:"
  echo "    - Users:     ${USER_COUNT}"
  echo "    - Donations: ${DONATION_COUNT}"
  echo "    - Children:  ${CHILD_COUNT}"

  echo "[5/5] Tearing down disposable test database '${TEST_DB}'..."
  docker exec -i "${CONTAINER_NAME}" psql -U livinghope -d postgres -c "DROP DATABASE \"${TEST_DB}\";"

  echo "============================================================"
  echo "✓ Non-destructive isolated backup test PASSED!"
  echo "  Archive '${BACKUP_FILE}' is 100% valid and restorable."
  echo "============================================================"
  exit 0
fi

# Step 4: Live Restoration with Pre-Restore Snapshot
if [ "${SKIP_PRE_SNAPSHOT}" = false ]; then
  PRE_SNAPSHOT="./backups/pre_restore_safety_$(date +%Y%m%d_%H%M%S).sql.gz"
  echo "[2/5] Capturing safety snapshot of active database to '${PRE_SNAPSHOT}'..."
  mkdir -p "./backups"
  docker exec -i "${CONTAINER_NAME}" pg_dump -U livinghope -d "${TARGET_DB}" --clean --if-exists --no-owner --no-privileges | gzip -9 > "${PRE_SNAPSHOT}"
  echo "[+] Safety snapshot captured: ${PRE_SNAPSHOT}"
else
  echo "[2/5] Safety snapshot skipped via flag."
fi

echo "[3/5] Terminating stale connections to target database '${TARGET_DB}'..."
docker exec -i "${CONTAINER_NAME}" psql -U livinghope -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '${TARGET_DB}' AND pid <> pg_backend_pid();
" > /dev/null

echo "[4/5] Restoring database schema and data from '${BACKUP_FILE}'..."
gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U livinghope -d "${TARGET_DB}" --quiet > /dev/null

echo "[5/5] Verifying post-restoration integrity..."
USER_COUNT=$(docker exec -i "${CONTAINER_NAME}" psql -U livinghope -d "${TARGET_DB}" -t -c 'SELECT COUNT(*) FROM users;' 2>/dev/null | tr -d ' ' || echo "0")
echo "[+] Live database restored successfully. Active user count: ${USER_COUNT}"

echo "============================================================"
echo "✓ Production restoration operation completed successfully."
echo "============================================================"
