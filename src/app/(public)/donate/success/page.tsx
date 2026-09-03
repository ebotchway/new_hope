import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Thank You" };

export default function DonateSuccessPage() {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="mx-auto max-w-md rounded-3xl bg-secondary p-10 text-center shadow-sm sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-navy/10">
          <CheckCircle2 className="size-8 text-foreground" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
          Thank you for your generosity!
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your donation is being processed. A confirmation and receipt will be sent to your
          email shortly.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-full px-7">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </section>
  );
}
