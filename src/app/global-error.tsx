"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[LivingHope Global Error]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#0B1B3D] text-white px-4 font-sans antialiased">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Temporary Connection Issue
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              We couldn’t reach the server. Please reload the page or check back in a moment.
            </p>
            {error.digest && (
              <p className="mt-2 text-xs font-mono text-slate-400">
                Reference: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 hover:bg-amber-300 text-[#0B1B3D] px-6 py-2.5 font-semibold text-sm transition-colors shadow-lg"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </button>
            <a
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white px-6 py-2.5 text-sm transition-colors"
            >
              <Home className="h-4 w-4" />
              Go to Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
