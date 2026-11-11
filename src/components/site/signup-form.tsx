"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, User, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signupSchema } from "@/lib/validations";
import { registerAction } from "@/actions/auth";
import type { z } from "zod";

type FormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!agreed) {
      setFormError("Please agree to the terms & child protection policy to continue.");
      return;
    }
    setFormError(null);
    try {
      const result = await registerAction(values);
      if (result.success) {
        router.push("/login?signup=success");
        router.refresh();
      } else {
        setFormError(result.error);
      }
    } catch {
      setFormError("Couldn't reach the server. Please check your network connection.");
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

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-semibold text-foreground">
          Full Name
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <User className="size-4" />
          </div>
          <Input
            id="name"
            placeholder="e.g. Kwaku Mensah"
            className="h-12 pl-10 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-brand-primary"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-foreground">
          Email Address
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <Mail className="size-4" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="e.g. kwaku@example.com"
            className="h-12 pl-10 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-brand-primary"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Password Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold text-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 characters"
              className="h-12 pr-10 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-brand-primary"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat password"
            className="h-12 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-brand-primary"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Agreement checkbox */}
      <div className="flex items-start gap-2.5 pt-1">
        <Checkbox
          id="terms"
          checked={agreed}
          onCheckedChange={(c) => setAgreed(Boolean(c))}
          className="mt-0.5 rounded"
        />
        <Label htmlFor="terms" className="text-xs text-muted-foreground leading-snug cursor-pointer font-normal">
          I agree to the{" "}
          <Link href="/terms" className="text-brand-navy hover:underline font-medium dark:text-blue-400">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-brand-navy hover:underline font-medium dark:text-blue-400">
            Privacy Policy
          </Link>
          .
        </Label>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Creating your account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </Button>

      {/* Link to login */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-navy hover:underline dark:text-blue-400">
          Log in
        </Link>
      </p>
    </form>
  );
}
