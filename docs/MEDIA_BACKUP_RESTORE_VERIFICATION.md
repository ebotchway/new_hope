# LivingHope Platform — Media Backup & Disaster Recovery Verification

**Date:** November 10, 2026  
**Automation Scripts:**
- `scripts/backup-db.sh` (Hardened Backup Engine with `--include-media`)
- `scripts/restore-db.sh` (Disaster Recovery Engine with `--restore-media` and `--test-restore`)

---

## 1. Unified Backup Engine Enhancements

Charity disaster recovery requires synchronized backup of both the relational state (donations, sponsorships, user accounts, and `CmsMediaAsset` catalog) and the unstructured photographic assets (`uploads/` and `images/`). Backing up the database without media leaves broken image links; backing up media without the database leaves orphaned files.

### Script Command Syntax:
```bash
# Full synchronized production backup:
./scripts/backup-db.sh --include-media [--dir ./backups]
```

### Execution Output Evidence:
```text
============================================================
LivingHope Production Database Backup
Target Container: new_hope-db-1
Output Archive:   ./backups/livinghope_db_20261110_213234.sql.gz
Timestamp:        20261110_213234
============================================================
[1/3] Streaming PostgreSQL database dump...
[2/3] Validating backup archive integrity...
[+] Database backup verified successfully: ./backups/livinghope_db_20261110_213234.sql.gz (13K)
[3/3] Backing up media uploads and site images...
[+] Media backup created: ./backups/livinghope_media_20261110_213234.tar.gz
============================================================
✓ Backup operation completed successfully.
============================================================
```

### Archive Integrity Verification:
1. **Database Archive (`.sql.gz`):**
   - Tested with `gzip -t`. Exit code: 0.
   - Header inspection: `-- PostgreSQL database dump` detected.
2. **Media Archive (`.tar.gz`):**
   - Tested with `tar -tzf`. Exit code: 0.
   - Verified that `uploads/children/amara.webp`, `uploads/cms/hero.webp`, etc., are packed cleanly.

---

## 2. Hardened Disaster Recovery & Media Restoration

### Script Command Syntax:
```bash
# 1. Non-destructive isolated verification (Dry-run):
./scripts/restore-db.sh --file ./backups/livinghope_db_YYYYMMDD.sql.gz --test-restore

# 2. Authorized production database & media restoration:
./scripts/restore-db.sh \
  --file ./backups/livinghope_db_YYYYMMDD.sql.gz \
  --restore-media ./backups/livinghope_media_YYYYMMDD.tar.gz \
  --confirm-restore
```

### Safety Interlocks & Recovery Sequence:
1. **Safety Gate:** Rejects execution unless `--confirm-restore` or `--test-restore` is explicitly supplied.
2. **Pre-Restore Snapshot:** Captures an immediate safety snapshot (`./backups/pre_restore_safety_*.sql.gz`) of the live database before making any modifications.
3. **Connection Termination:** Safely terminates existing client connections using `pg_terminate_backend` without leaving open locks.
4. **Relational Restoration:** Restores full schema, indexes, and records from the compressed SQL archive.
5. **Media Extraction:** Unpacks `./backups/livinghope_media_*.tar.gz` into `public/` and synchronizes the files into the active application container using `docker cp`.
6. **Integrity Audit:** Queries `SELECT COUNT(*) FROM users;` and verifies child/media counts.

---

## 3. Disaster Recovery Drill Verification Results

| Recovery Drill Step | Target Environment | Tested Action | Expected Result | Actual Result | Verification Status |
|---|---|---|---|---|---|
| **Step 1: Test Restore** | Disposable DB (`restore_verify_*`) | `./scripts/restore-db.sh --file <bak> --test-restore` | Schema restores, counts verified, temporary DB dropped | Users: 1, Donations: 2, Children: 3 verified; dropped cleanly | **PASSED** |
| **Step 2: Pre-Restore Safety Snapshot** | Production DB | Live restore with automated snapshot | Snapshot generated in `./backups/pre_restore_safety_*.sql.gz` | Valid 13KB compressed archive generated | **PASSED** |
| **Step 3: Database Restore** | Production DB | Schema & table restore from backup | Zero SQL syntax errors, tables populated | 100% relational state restored | **PASSED** |
| **Step 4: Media Archive Restore** | Container Volume | Extract tar.gz and sync to `/app/public/` | All photos present on disk and container | Amara, Kwame, Efua & CMS assets restored | **PASSED** |
| **Step 5: End-to-End HTTP Probe** | Next.js Server (Port 3010) | HTTP GET `/images/home/hero.webp` & `/uploads/children/amara.webp` | HTTP 200 with matching Content-Length | HTTP 200 OK (145,058 & 34,620 bytes) | **PASSED** |

