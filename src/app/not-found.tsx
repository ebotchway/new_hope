import Link from "next/link";

// Root fallback for URLs that don't match any route at all (e.g. outside the public
// site's segment tree). Renders inside the existing root layout — no <html>/<body> here.
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you&apos;re looking for may have moved, or the link might be out of date.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-navy-dark"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
