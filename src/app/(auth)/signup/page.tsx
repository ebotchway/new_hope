import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignupForm } from "@/components/site/signup-form";
import { GoogleSignInButton } from "@/components/site/google-signin-button";

export const metadata = {
  title: "Create Account | LivingHope Partner Portal",
  description: "Create an account to track your child sponsorships, donations, and receive termly progress reports.",
};

export default function SignupPage() {
  return (
    <Card className="w-full border-border/80 bg-card/95 backdrop-blur-xs shadow-xl shadow-brand-navy/5 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-2 p-6 sm:p-8 text-center border-b border-border/40 bg-secondary/20">
        <span className="inline-flex self-center items-center gap-1.5 rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-brand-gold-dark">
          New Supporter Registration
        </span>
        <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
          Join LivingHope
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Create your account to start sponsoring a child and follow their educational transformation.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-6">
        <SignupForm />

        <div className="relative flex items-center justify-center">
          <Separator className="w-full" />
          <span className="absolute bg-card px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            or continue with
          </span>
        </div>

        <GoogleSignInButton />
      </CardContent>
    </Card>
  );
}
