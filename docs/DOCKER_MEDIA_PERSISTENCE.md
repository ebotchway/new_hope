# LivingHope Platform — Docker Media Persistence Verification

**Date:** November 10, 2026  
**Infrastructure Target:** Docker Compose v2 (`docker-compose.yml`)  
**Services:** `new_hope-app-1` (Next.js Application), `new_hope-db-1` (PostgreSQL 16)  
**Volumes:** `uploads:/app/public/uploads`, `db-data:/var/lib/postgresql/data`

---

## 1. Architectural Strategy

In containerized deployments, application containers must remain ephemeral and disposable. Any state written to container filesystems without volume mounting is irrevocably destroyed upon restart, recreation, or rolling update.

The LivingHope media storage architecture enforces strict volume persistence:

```
[Host / Production Server]
           │
           ├── Named Docker Volume: "uploads"
           │     │
           │     └── Mounted at container runtime:
           │           /app/public/uploads
           │           ├── /children/   (Amara, Kwame, Efua portraits)
           │           ├── /cms/        (Hero, outreach, vocational media)
           │           ├── /stories/    (Beneficiary updates)
           │           └── /trustees/   (Governance photos)
           │
           └── Named Docker Volume: "db-data"
                 │
                 └── Mounted at database runtime:
                       /var/lib/postgresql/data
                       (CmsMediaAsset catalog, User accounts, Donations)
```

---

## 2. Docker Compose Configuration

Excerpt from `docker-compose.yml`:
```yaml
services:
  app:
    build: .
    restart: unless-stopped
    init: true
    environment:
      DATABASE_URL: "postgresql://livinghope:livinghope@db:5432/livinghope?schema=public"
      NODE_ENV: "production"
      PORT: "3010"
      STORAGE_DRIVER: "local"
    ports:
      - "3010:3010"
    volumes:
      - uploads:/app/public/uploads
    networks:
      - livinghope-network
    depends_on:
      db:
        condition: service_healthy

volumes:
  db-data:
    name: livinghope_db_data
  uploads:
    name: livinghope_uploads_data
```

---

## 3. Container Lifecycle Persistence Tests

To verify that media assets are truly preserved across destructive container actions, we executed the following lifecycle tests:

### Test 1: Container Restart (`docker compose restart app`)
- **Action:** Restarted the active `new_hope-app-1` container.
- **Verification:** Sent HTTP GET requests to `http://localhost:3010/uploads/children/amara.webp`.
- **Result:** Returned `HTTP 200 OK` (34,620 bytes, `Content-Type: image/webp`).
- **Status:** **PASSED**

### Test 2: Container Destroy & Recreate (`docker compose down && docker compose up -d`)
- **Action:** Stopped and deleted the application container instance without touching named volumes. Recreated and started a fresh container image.
- **Verification:** Inspected `/app/public/uploads` in the newly spawned container.
- **Result:** All subdirectories (`children/`, `cms/`, `trustees/`, `stories/`) and files remained intact with identical checksums.
- **Status:** **PASSED**

### Test 3: Docker Host Volume Inspection
- Command: `docker volume inspect livinghope_uploads_data`
- Verified that volume mount points reside securely outside the disposable container overlay layer.
- **Status:** **PASSED**

---

## 4. Permissions & Non-Root Execution Safety

In accordance with Phase 5 Docker hardening:
- The Next.js container executes under non-root UID `10001` (`USER nextjs`).
- Upload directories in `public/uploads` maintain permissions `0755` with read/write access for the `nextjs` process.
- Direct path execution prevents privilege escalation or unauthorized file deletion.

