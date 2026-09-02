"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validations";
import { loginAction } from "@/actions/auth";
import type { z } from "zod";

type FormValues = z.infer<typeof loginSchema>;

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    const result = await loginAction(values);
    if (result.success) {
      router.push(callbackUrl ?? "/");
      router.refresh();
    } else {
      setFormError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        <Link href="/forgot-password" className="justify-self-end text-xs text-muted-foreground hover:underline">
          Forget your Password?
        </Link>
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have any account?{" "}
        <Link href="/signup" className="font-medium text-foreground hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}
