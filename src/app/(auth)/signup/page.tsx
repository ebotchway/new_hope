import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignupForm } from "@/components/site/signup-form";
import { GoogleSignInButton } from "@/components/site/google-signin-button";

export const metadata = { title: "Sign Up" };

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-xl">Create your account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <SignupForm />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <GoogleSignInButton />
      </CardContent>
    </Card>
  );
}
