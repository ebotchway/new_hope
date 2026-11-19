"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/email";
import type { ActionResult } from "@/actions/inquiries";

export interface LoginActionResult {
  success: boolean;
  error?: string;
  role?: string;
  defaultUrl?: string;
}

export async function loginAction(values: unknown): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const password = parsed.data.password;

  try {
    await signIn("credentials", { email, password, redirect: false });

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { email: email.includes("@") ? email : `${email}@livinghope.org` },
          { name: { equals: email, mode: "insensitive" } },
        ],
      },
      select: { role: true },
    });

    const isStaff = user?.role === "ADMIN" || user?.role === "STAFF";
    return {
      success: true,
      role: user?.role,
      defaultUrl: isStaff ? "/admin" : "/account",
    };
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return { success: false, error: "Invalid email or password" };
    }
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage.includes("CredentialsSignin") || errMessage.includes("CallbackRouteError")) {
      return { success: false, error: "Invalid email or password" };
    }
    return { success: false, error: "Authentication failed. Please check your credentials." };
  }
}

export async function signInWithGoogle(callbackUrl?: string): Promise<{ success: boolean; error?: string }> {
  const googleClientId = process.env.AUTH_GOOGLE_ID?.trim() || process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.AUTH_GOOGLE_SECRET?.trim() || process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!googleClientId || !googleClientSecret) {
    return {
      success: false,
      error: "Google Sign-In is temporarily unavailable. Missing OAuth client configuration. Please use email & password or contact the system administrator.",
    };
  }

  const safeCallback =
    callbackUrl &&
    typeof callbackUrl === "string" &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    !callbackUrl.startsWith("/\\")
      ? callbackUrl
      : "/";

  await signIn("google", { redirectTo: safeCallback });
  return { success: true };
}

export async function registerAction(values: unknown): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "DONOR",
    },
  });

  return { success: true };
}

export async function requestPasswordReset(values: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Timing-safe response: always return success to prevent account enumeration
  if (!user) {
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3010";
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name ?? "Friend",
      resetLink,
    });
  } catch (err) {
    console.error("Failed to send reset email:", err);
  }

  return { success: true };
}

export async function resetPasswordAction(values: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { token, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gte: new Date() },
    },
  });

  if (!user) {
    return { success: false, error: "Password reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return { success: true };
}
