import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Reset Password" };

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-xl">Reset your password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
        <p>
          Password reset via email isn&apos;t enabled yet. Please contact the LivingHope team
          directly to regain access to your account.
        </p>
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Back to log in
        </Link>
      </CardContent>
    </Card>
  );
}
