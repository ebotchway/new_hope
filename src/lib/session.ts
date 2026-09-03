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
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    // Already signed in, just not privileged enough — bouncing to /login would be
    // confusing (they're not logged out). Send them back to the dashboard they do have.
    redirect("/admin");
  }
  return session;
}
