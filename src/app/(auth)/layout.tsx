import { Logo } from "@/components/site/logo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-secondary/50 via-background to-secondary/30">
      {/* Compact, clean navigation header */}
      <header className="px-4 pt-4 sm:pt-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to LivingHope</span>
          </Link>
          <div className="rounded-xl bg-brand-navy px-4 py-2 text-white shadow-xs">
            <Logo light size="sm" tagline={false} />
          </div>
        </div>
      </header>

      {/* Main Authentication Card Viewport */}
      <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-[500px]">{children}</div>
      </main>

      {/* Subtle, reassuring footer */}
      <footer className="px-4 py-4 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} LivingHope Charity Foundation. All rights reserved.</p>
        <p className="mt-1 text-[11px] text-muted-foreground/80">
          Secure 256-bit SSL encrypted connection &middot; Child safeguarding compliant
        </p>
      </footer>
    </div>
  );
}
