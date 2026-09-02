import { Logo } from "@/components/site/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <header className="p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-center rounded-2xl bg-brand-navy px-6 py-4">
          <Logo light tagline />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
    </div>
  );
}
