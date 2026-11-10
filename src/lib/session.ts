import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Ensures the requesting user is authenticated and has STAFF or ADMIN role.
 * Queries the database directly to guarantee instant revocation if a role is downgraded.
 */
export async function requireStaff() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "STAFF")) {
    redirect("/login");
  }

  session.user.role = dbUser.role;
  return session;
}

/**
 * Ensures the requesting user is authenticated and has ADMIN role.
 * Queries the database directly to guarantee instant revocation.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect(dbUser?.role === "STAFF" ? "/admin" : "/login");
  }

  session.user.role = dbUser.role;
  return session;
}
