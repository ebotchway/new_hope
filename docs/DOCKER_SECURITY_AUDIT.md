# LivingHope Platform — Docker Infrastructure & Container Security Audit

**Assessment Date:** 2026-11-10  
**Target:** Production Docker Deployment Stack  
**Orchestration:** Docker Compose v2  
**Images:** `node:20-alpine`, `postgres:16-alpine`  

---

## 1. Container Privilege & User Isolation

### 1.1 Non-Root User Execution
- **Compliance Standard:** CIS Docker Benchmark 4.1 (Ensure that a user for the container has been created).
- **Implementation:** The application container creates a dedicated system user and group:
  ```dockerfile
  RUN addgroup --system --gid 1001 nodejs && \
      adduser --system --uid 1001 nextjs
  ```
- **Runtime User:** `USER nextjs` (UID: 1001, GID: 1001).
- **Verification:** Verified that the Node.js process does not run as `root` (UID 0), preventing host root privilege escalation in the event of an application container breakout.

### 1.2 Storage Volume Permissions
- **Upload Directory:** `/app/public/uploads` is owned by `nextjs:nodejs` (`chown -R nextjs:nodejs /app/public/uploads`).
- **Isolation:** Application cannot write to root-owned system directories (`/etc`, `/bin`, `/usr`).

---

## 2. Resource Management & Denial of Service Defenses

### 2.1 CPU & Memory Allocation Limits
To prevent runaway memory leaks or DoS exhaustion from starving the host OS, strict resource limits are enforced in `docker-compose.yml`:

| Service | Memory Limit | CPU Limit | Rationale |
|---|---|---|---|
| `app` (Next.js) | `1024M` (1 GB) | `2.0 CPUs` | Accommodates Turbopack SSR and traffic spikes |
| `db` (PostgreSQL) | `512M` | `1.0 CPU` | Sufficient for connection pooling and buffer cache |

### 2.2 Container Log Rotation
Unbounded stdout/stderr Docker logging can fill the host disk, causing host crashes. Both services enforce log rotation via the `json-file` logging driver:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```
Maximum log disk usage is capped at 30 MB per container.

---

## 3. Network Isolation & Service Exposure

### 3.1 Custom Bridge Network
- **Network Name:** `livinghope-network`
- **Isolation:** Containers communicate via Docker internal DNS names (`db`, `app`) over an isolated bridge network.
- **Port Exposure Policy:**
  - Production deployments only expose port `3010` (HTTP) or `443` (via reverse proxy).
  - PostgreSQL port `5432` is not exposed publicly on production interfaces; access is restricted to the internal network.

---

## 4. Secret & Environment Variable Hardening

### 4.1 Secrets Protection
- **No Hardcoded Secrets:** Dockerfile does not copy `.env` files into image layers.
- **Environment Ingestion:** Variables (`AUTH_SECRET`, `STRIPE_SECRET_KEY`, `DATABASE_URL`) are injected strictly at runtime via `env_file: .env` or orchestration secrets.
- **Prisma Client Generation:** Pre-generated inside the builder stage without requiring database connection strings.

---

## 5. Health Check & Fault Recovery

### 5.1 Application Health Endpoint (`/api/health`)
- **Probe Interval:** 10s
- **Timeout:** 5s
- **Retries:** 12
- **Checks:** Real `SELECT 1` database query, process uptime, memory consumption, latency.
- **Auto-Healing:** If the database becomes unreachable, Docker Compose marks the container `unhealthy`, allowing upstream load balancers to redirect traffic.

---

## 6. Audit Verdict

| Security Domain | Finding | CIS Benchmark Status |
|---|---|---|
| User Privileges | Container runs as non-root `nextjs:1001` | **PASS** |
| Resource Limits | Memory and CPU limits configured | **PASS** |
| Log Rotation | JSON log rotation capped at 30MB | **PASS** |
| Health Probes | Active health check on port 3010 | **PASS** |
| Attack Surface | Alpine Linux minimal runtime | **PASS** |
| Overall Security Rating | **PRODUCTION-GRADE COMPLIANT** | **PASS** |

