import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-foreground">
          <HeartHandshake className="size-6" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you&apos;re looking for may have moved, or the link might be out of date.
          Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link href="/">Return home</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/sponsor-a-child">Browse children</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
