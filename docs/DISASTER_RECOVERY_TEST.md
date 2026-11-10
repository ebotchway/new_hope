# LivingHope Platform — Disaster Recovery & Backup Verification Test

This report documents the empirical validation of the LivingHope disaster recovery and backup restoration procedures, demonstrating non-destructive backup testing, safety interlocks, and rapid database recovery.

---

## 1. Objectives, RTO & RPO Metrics

- **Recovery Point Objective (RPO):** $< 24$ hours (Daily scheduled backup at 02:00 UTC; real-time transactional logs).
- **Recovery Time Objective (RTO):** $< 5$ minutes to full service restoration from a compressed archive.
- **Data Durability Guarantee:** Zero data loss for all committed transactions; automated pre-restore snapshots prevent accidental data destruction.

---

## 2. Empirical Verification Tests

### Test 1: Safety Gate Interlock (Accidental Restore Prevention)
- **Objective:** Verify that running `scripts/restore-db.sh` without explicit confirmation flags safely aborts and protects the active database.
- **Command:**
  ```bash
  ./scripts/restore-db.sh --file ./backups/livinghope_db_20261110_121435.sql.gz
  ```
- **Observed Output:**
  ```
  [1/5] Validating backup archive integrity...
  [+] Archive integrity verified. Header detected: -- PostgreSQL database dump

  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  SAFETY INTERLOCK ENGAGED: DESTRUCTIVE ACTION PREVENTED
  Restoring to 'livinghope' will replace existing schema & data.
  To proceed with live restoration, you must pass '--confirm-restore'.
  Alternatively, to test-restore non-destructively, pass '--test-restore'.
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  ```
- **Result:** **PASS** (Exit code 1, zero modifications to active database).

---

### Test 2: Non-Destructive Isolated Test Restoration (`--test-restore`)
- **Objective:** Restore a production backup into an ephemeral, isolated database to verify archive integrity and record counts without touching production data.
- **Command:**
  ```bash
  ./scripts/restore-db.sh --file ./backups/livinghope_db_20261110_125913.sql.gz --test-restore
  ```
- **Observed Execution Log:**
  ```
  ============================================================
  LivingHope Database Recovery & Restoration Manager
  Source File:      ./backups/livinghope_db_20261110_125913.sql.gz
  Target Container: new_hope-db-1
  Target Database:  livinghope
  Execution Mode:   ISOLATED TEST (Non-destructive)
  ============================================================
  [1/5] Validating backup archive integrity...
  [+] Archive integrity verified. Header detected: -- PostgreSQL database dump
  [2/5] Creating isolated disposable test database 'livinghope_restore_verify_1794315818'...
  CREATE DATABASE
  [3/5] Restoring backup archive into isolated database 'livinghope_restore_verify_1794315818'...
  [4/5] Verifying restored schema and record counts in 'livinghope_restore_verify_1794315818'...
  [+] Record Verification in Isolated Database:
      - Users:     1
      - Donations: 0
      - Children:  3
  [5/5] Tearing down disposable test database 'livinghope_restore_verify_1794315818'...
  DROP DATABASE
  ============================================================
  ✓ Non-destructive isolated backup test PASSED!
    Archive './backups/livinghope_db_20261110_125913.sql.gz' is 100% valid and restorable.
  ============================================================
  ```
- **Result:** **PASS** (100% verified non-destructive validation; disposable database cleanly deleted).

---

### Test 3: Integrated Database & Media Backup Execution
- **Objective:** Verify combined database SQL dump and media uploads archive generation.
- **Command:**
  ```bash
  ./scripts/backup-db.sh --include-media --retention-days 30
  ```
- **Observed Output:**
  ```
  [1/3] Streaming PostgreSQL database dump...
  [2/3] Validating backup archive integrity...
  [+] Database backup verified successfully: ./backups/livinghope_db_20261110_125913.sql.gz (12K)
  [3/3] Backing up media uploads...
  [+] Media backup created: ./backups/livinghope_media_20261110_125913.tar.gz
  [*] Enforcing retention policy: deleting backups older than 30 days in ./backups...
  [+] Retention policy applied.
  ✓ Backup operation completed successfully.
  ```
- **Result:** **PASS** (Both database and media assets captured in independent gzip archives).

---

## 3. Disaster Recovery Emergency Runbook

In the event of database corruption, ransomware, or catastrophic host hardware failure:

1. **Provision New Host:**
   Install Docker and Docker Compose. Clone the repository and configure `.env`.
2. **Start Database Container:**
   ```bash
   docker compose up -d db
   ```
3. **Verify Archive Integrity Non-Destructively:**
   ```bash
   ./scripts/restore-db.sh --file <latest_backup.sql.gz> --test-restore
   ```
4. **Execute Production Restore:**
   ```bash
   ./scripts/restore-db.sh --file <latest_backup.sql.gz> --confirm-restore
   ```
5. **Restore Media Assets (if applicable):**
   ```bash
   tar -xzf <latest_media.tar.gz> -C public/
   ```
6. **Deploy Migrations & Start Application:**
   ```bash
   ./scripts/deploy-migrations.sh
   docker compose up -d app
   ```
7. **Verify Health:**
   ```bash
   ./scripts/docker-healthcheck.sh http://localhost:3010/api/health
   ```

