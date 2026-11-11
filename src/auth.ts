import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Check whether Google OAuth credentials are meaningfully configured
const googleClientId = process.env.AUTH_GOOGLE_ID?.trim() || process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET?.trim() || process.env.GOOGLE_CLIENT_SECRET?.trim();
export const isGoogleAuthAvailable = Boolean(googleClientId && googleClientSecret);

const providers = [
  ...(isGoogleAuthAvailable
    ? [
        Google({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          allowDangerousEmailAccountLinking: false, // Strict: Prevent account takeover by unverified Google emails
        }),
      ]
    : []),
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      const rawEmail = credentials?.email;
      const password = credentials?.password;
      if (typeof rawEmail !== "string" || typeof password !== "string") {
        return null;
      }

      const email = rawEmail.toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const normalizedEmail = user.email.toLowerCase().trim();

        // Check if an account already exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true, role: true },
        });

        // If user already exists in DB, role must remain strictly intact
        if (existingUser) {
          user.role = existingUser.role;
        } else {
          // New Google users ALWAYS default to DONOR, never elevated
          user.role = "DONOR";
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? "DONOR";
        token.id = user.id;
      } else if (token.id) {
        // Authoritative role lookup from database to enforce instant revocation
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "DONOR" | "STAFF" | "ADMIN") ?? "DONOR";
      }
      return session;
    },
  },
});
