import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Verify database connectivity with 3s timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timed out")), 3000)
      ),
    ]);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        latencyMs,
        checks: {
          database: "connected",
        },
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal service check failure";

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        checks: {
          database: "disconnected",
        },
        error: message,
      },
      { status: 503 }
    );
  }
}
