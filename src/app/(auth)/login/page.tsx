import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/components/site/login-form";
import { GoogleSignInButton } from "@/components/site/google-signin-button";

export const metadata = {
  title: "Log In | LivingHope Partner & Supporter Portal",
  description: "Access your LivingHope account to manage recurring sponsorships, view impact updates, and track donations.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const callbackUrl = typeof searchParams.callbackUrl === "string" ? searchParams.callbackUrl : undefined;

  return (
    <Card className="w-full border-border/80 bg-card/95 backdrop-blur-xs shadow-xl shadow-brand-navy/5 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-2 p-6 sm:p-8 text-center border-b border-border/40 bg-secondary/20">
        <span className="inline-flex self-center items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
          Partner & Supporter Portal
        </span>
        <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Sign in to view your sponsored children, termly progress reports, and tax receipts.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-6">
        <LoginForm callbackUrl={callbackUrl} />

        <div className="relative flex items-center justify-center">
          <Separator className="w-full" />
          <span className="absolute bg-card px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            or continue with
          </span>
        </div>

        <GoogleSignInButton callbackUrl={callbackUrl} />
      </CardContent>
    </Card>
  );
}
