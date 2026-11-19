import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible NextAuth configuration.
 * Contains only lightweight, edge-safe logic (no Prisma, no pg, no bcrypt).
 * Used by proxy.ts / middleware.ts in Edge runtimes.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [], // Injected in auth.ts with full Node.js database providers
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const role = auth?.user?.role;
      const isStaff = role === "ADMIN" || role === "STAFF";
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isOnAdmin && !isStaff) {
        return false;
      }
      return true;
    },
  },
};
