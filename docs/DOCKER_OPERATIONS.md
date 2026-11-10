# LivingHope Platform — Docker Operations & Runbook

This runbook provides actionable procedures, maintenance commands, backup/restore instructions, and disaster recovery workflows for administrators and DevOps engineers operating the LivingHope Platform container stack.

---

## 1. Quick Reference & Common Commands

### 1.1 Starting and Stopping Services
```bash
# Start all services in the background (detached mode)
docker compose up -d

# View status and health of all services
docker compose ps

# Follow real-time application logs
docker compose logs -f app

# Follow real-time PostgreSQL database logs
docker compose logs -f db

# Stop all services gracefully without deleting volumes
docker compose down

# Stop all services and remove orphan containers
docker compose down --remove-orphans
```

### 1.2 Rebuilding Application Image After Code Updates
```bash
# Rebuild the application image and restart the container
docker compose up -d --build app
```

### 1.3 Executing Commands in Running Containers
```bash
# Open an interactive shell inside the application container as non-root user
docker compose exec app sh

# Open an interactive PostgreSQL psql shell inside the database container
docker compose exec db psql -U livinghope -d livinghope

# Check database tables
docker compose exec db psql -U livinghope -d livinghope -c "\dt"
```

---

## 2. Health Monitoring & Verification

### 2.1 Checking Application Health
Run the automated health check script against the running instance:
```bash
./scripts/docker-healthcheck.sh http://localhost:3010/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-10T12:29:29.294Z",
  "uptimeSeconds": 27,
  "latencyMs": 2,
  "checks": {
    "database": "connected"
  },
  "version": "0.1.0",
  "environment": "production"
}
```

If the database is down or unreachable, the endpoint returns `HTTP 503 Service Unavailable` with details on the failure.

---

## 3. Database Backup Operations

The LivingHope repository includes an automated, timestamped database backup utility: [`scripts/backup-db.sh`](file:///Users/qwaku/Codes/QBE/new_hope/scripts/backup-db.sh).

### 3.1 Executing an On-Demand Backup
```bash
./scripts/backup-db.sh
```
- **Output:** Stored in `./backups/` as `livinghope_db_YYYYMMDD_HHMMSS.sql.gz`.
- **Integrity Check:** The script validates that `pg_dump` exits with code 0 and verifies that the output gzip archive has non-zero byte size before exiting.

### 3.2 Automated Cron Scheduling
To configure automated daily backups at 02:00 AM UTC on the host system:
```bash
0 2 * * * cd /path/to/new_hope && ./scripts/backup-db.sh >> /var/log/livinghope_backup.log 2>&1
```

---

## 4. Database Disaster Recovery & Restoration

The restoration utility [`scripts/restore-db.sh`](file:///Users/qwaku/Codes/QBE/new_hope/scripts/restore-db.sh) safely restores a compressed database dump into the PostgreSQL container.

### 4.1 Restoring From Backup
```bash
# Syntax: ./scripts/restore-db.sh <path-to-compressed-backup-file>
./scripts/restore-db.sh ./backups/livinghope_db_20261110_121435.sql.gz
```

### 4.2 Restoration Safety Protocol
1. **Safety Backup:** The restore script automatically generates a safety backup of the active database before executing the restore, safeguarding against accidental overwrites.
2. **Connection Termination:** Disconnects active client sessions using `pg_terminate_backend()` to prevent deadlocks.
3. **Clean Schema Recreation:** Drops and recreates the `public` schema prior to streaming the SQL archive.
4. **Verification:** Executes a post-restore verification query to confirm model tables (`User`, `Donation`, `Child`) are intact.

---

## 5. Persistent Volume Management

LivingHope persists data through two dedicated Docker named volumes:
- `db-data`: Stores all PostgreSQL data files (`/var/lib/postgresql/data`). Survives container deletion.
- `uploads`: Stores uploaded media, photos, and PDF progress reports (`/app/public/uploads`).

### Inspecting Volume Data
```bash
# List all Docker volumes
docker volume ls | grep new_hope

# Inspect database volume details
docker volume inspect new_hope_db-data

# Inspect media uploads volume
docker volume inspect new_hope_uploads
```

> [!CAUTION]
> Never execute `docker compose down -v` in a production environment as the `-v` flag removes named volumes, destroying PostgreSQL data and uploaded media.

---

## 6. Troubleshooting & Common Scenarios

### Scenario A: Container Fails to Start with `P3005: The database schema is not empty`
- **Cause:** Database contains tables created outside of migration tracking (or missing `_prisma_migrations` records).
- **Resolution:** Baseline the existing migrations:
  ```bash
  npx prisma migrate resolve --applied <migration_name>
  ```
  Then restart the container with `docker compose restart app`.

### Scenario B: Upload Directory Permission Errors
- **Cause:** Upload directory owned by `root` instead of `nextjs:nodejs` (UID 1001).
- **Resolution:**
  ```bash
  docker compose exec -u 0 app chown -R nextjs:nodejs /app/public/uploads
  ```

### Scenario C: High Database Latency
- **Diagnosis:** Run `./scripts/docker-healthcheck.sh http://localhost:3010/api/health` and observe `latencyMs`. If $> 100\text{ms}$, inspect connection pool settings or slow queries in PostgreSQL logs (`docker compose logs db`).

