import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "STAFF")) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}
