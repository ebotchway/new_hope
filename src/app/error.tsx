"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[LivingHope App Error]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
        <AlertCircle className="h-8 w-8" />
      </div>

      <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
        Something went wrong
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        We encountered an unexpected connection issue while processing this request. Our technical team has been notified.
      </p>

      {error.digest && (
        <p className="mt-2 text-xs font-mono text-muted-foreground/60">
          Ref: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          className="gap-2 rounded-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90 font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>

        <Button asChild variant="outline" className="gap-2 rounded-full">
          <Link href="/">
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </Button>

        <Button asChild variant="ghost" className="gap-2 rounded-full">
          <Link href="/contact">
            <HeartHandshake className="h-4 w-4" />
            Contact Support
          </Link>
        </Button>
      </div>
    </div>
  );
}
