import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/components/site/login-form";
import { GoogleSignInButton } from "@/components/site/google-signin-button";

export const metadata = { title: "Log In" };

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const callbackUrl = typeof searchParams.callbackUrl === "string" ? searchParams.callbackUrl : undefined;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-xl">Log in to your account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <LoginForm callbackUrl={callbackUrl} />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <GoogleSignInButton callbackUrl={callbackUrl} />
      </CardContent>
    </Card>
  );
}
