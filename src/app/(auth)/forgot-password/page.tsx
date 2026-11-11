import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/site/forgot-password-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Forgot Password | LivingHope Supporter Portal",
  description: "Reset your password to regain access to your LivingHope account and sponsorship profile.",
};

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full border-border/80 bg-card/95 backdrop-blur-xs shadow-xl shadow-brand-navy/5 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-2 p-6 sm:p-8 text-center border-b border-border/40 bg-secondary/20">
        <span className="inline-flex self-center items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
          Account Security
        </span>
        <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
          Reset Your Password
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Enter your registered email and we&apos;ll send you a secure verification link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 space-y-5">
        <ForgotPasswordForm />
        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:underline dark:text-blue-400"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Log in</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
