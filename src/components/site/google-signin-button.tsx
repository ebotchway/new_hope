"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/actions/auth";
import { AlertCircle, Loader2 } from "lucide-react";

export function GoogleSignInButton({ callbackUrl }: { callbackUrl?: string }) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await signInWithGoogle(callbackUrl);
      if (!res.success && res.error) {
        setErrorMsg(res.error);
        setIsLoading(false);
      }
    } catch {
      // In normal redirect flows, NextAuth throws a NEXT_REDIRECT which is expected,
      // but if a true network error happens, catch and display:
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">{errorMsg}</p>
        </div>
      )}
      <Button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        variant="outline"
        className="w-full h-12 rounded-xl border-border/80 bg-card hover:bg-secondary/60 text-foreground font-semibold text-sm shadow-xs flex items-center justify-center gap-3 transition-all"
      >
        {isLoading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <svg viewBox="0 0 24 24" className="size-5 shrink-0">
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.6 5.6 0 0 1-2.4 3.65v3h3.86c2.27-2.09 3.56-5.17 3.56-8.89Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.86-3c-1.07.72-2.45 1.14-4.07 1.14-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.37l3.98-3.09Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.63l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77Z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </Button>
    </div>
  );
}
