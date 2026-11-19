"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validations";
import { loginAction } from "@/actions/auth";
import type { z } from "zod";

type FormValues = z.infer<typeof loginSchema>;

function getSafeCallbackUrl(url?: string): string {
  if (!url || typeof url !== "string") return "/";
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return trimmed;
  }
  return "/";
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      const result = await loginAction(values);
      if (result.success) {
        const explicitCallback =
          callbackUrl && callbackUrl !== "/" ? getSafeCallbackUrl(callbackUrl) : null;
        const target = explicitCallback ?? result.defaultUrl ?? "/admin";
        router.push(target);
        router.refresh();
      } else {
        setFormError(result.error ?? "Authentication failed. Please check your credentials.");
      }
    } catch {
      setFormError("Couldn't reach the authentication server. Please check your network connection.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{formError}</p>
        </div>
      )}

      {/* Email or username input field */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-foreground">
          Email Address or Username
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <Mail className="size-4" />
          </div>
          <Input
            id="email"
            type="text"
            autoComplete="username"
            placeholder="e.g. brightnerone or admin1@livinghope.org"
            className="h-12 pl-10 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-brand-primary"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Password input field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-semibold text-foreground">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-brand-primary hover:underline hover:text-brand-primary-hover"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <Lock className="size-4" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="h-12 pl-10 pr-10 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-brand-primary"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Verifying credentials...</span>
          </>
        ) : (
          <span>Log in to Account</span>
        )}
      </Button>

      {/* Sign-up invitation */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        Don&apos;t have an account yet?{" "}
        <Link href="/signup" className="font-semibold text-brand-navy hover:underline dark:text-blue-400">
          Sign up to join our mission
        </Link>
      </p>
    </form>
  );
}
