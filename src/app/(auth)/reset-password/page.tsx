import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/site/reset-password-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export const metadata = { title: "Set New Password — LivingHope Supporter Portal" };

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : null;

  if (!token) {
    return (
      <Card className="w-full border-border/80 bg-card shadow-xl rounded-2xl overflow-hidden text-center">
        <CardHeader className="p-6 sm:p-8 space-y-3 bg-secondary/20 border-b border-border/40">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle className="text-xl font-bold font-heading">Invalid or Missing Link</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new link to secure your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <Button asChild className="w-full h-12 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold">
            <Link href="/forgot-password">Request New Reset Link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/80 bg-card/95 backdrop-blur-xs shadow-xl shadow-brand-navy/5 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-2 p-6 sm:p-8 text-center border-b border-border/40 bg-secondary/20">
        <span className="inline-flex self-center items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
          Password Update
        </span>
        <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
          Set New Password
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Choose a secure password of at least 8 characters for your LivingHope account.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <ResetPasswordForm token={token} />
      </CardContent>
    </Card>
  );
}
