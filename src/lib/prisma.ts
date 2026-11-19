import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

/**
 * Normalizes connection string for application runtime queries.
 * When pointing to a Supabase connection pooler on port 5432 (session mode),
 * automatically switches application traffic to port 6543 (transaction mode pooler)
 * with pgbouncer=true to prevent EMAXCONNSESSION (max 15 clients).
 */
function getRuntimeDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL || process.env.SUPABASE_CONNECT;
  if (!raw) return undefined;

  if (raw.includes("pooler.supabase.com:5432")) {
    let normalized = raw.replace(":5432", ":6543");
    if (!normalized.includes("pgbouncer=true")) {
      const separator = normalized.includes("?") ? "&" : "?";
      normalized = `${normalized}${separator}pgbouncer=true`;
    }
    return normalized;
  }
  return raw;
}

const dbUrl = getRuntimeDatabaseUrl();

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: dbUrl,
    // Keep max connections small in production serverless environments to avoid saturating limits
    max: process.env.NODE_ENV === "production" ? 3 : 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 8000,
  });

// Catch unexpected errors on idle pool clients without crashing the process
pool.on("error", (err) => {
  console.warn("[PostgreSQL Pool Warning] Unexpected idle client error:", err.message);
});

// Cache on globalThis across all environments so serverless containers re-use the connection pool
globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

globalForPrisma.prisma = prisma;

export { pool };

export async function closeDatabaseConnection() {
  await prisma.$disconnect();
  await pool.end();
}
