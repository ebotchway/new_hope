import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Thank You" };

export default function DonateSuccessPage() {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="mx-auto max-w-md text-center">
        <CheckCircle2 className="mx-auto size-14 text-brand-navy" />
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-brand-navy">
          Thank you for your generosity!
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your donation is being processed. A confirmation and receipt will be sent to your
          email shortly.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </section>
  );
}
