"use server";

import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, signupSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/inquiries";

export async function loginAction(values: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
    return { success: true };
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return { success: false, error: "Invalid email or password" };
    }
    throw error;
  }
}

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", { redirectTo: callbackUrl ?? "/" });
}

export async function registerAction(values: unknown): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash } });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    // Account was created; the user can still sign in manually if the session bootstrap fails.
  }

  return { success: true };
}
