import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getCmsAppearance } from "@/lib/cms-loader";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const appearance = await getCmsAppearance();

  return (
    <div
      className="flex min-h-screen flex-col"
      style={
        {
          "--brand-primary": appearance.primaryColor,
          "--brand-secondary": appearance.secondaryColor,
          "--brand-accent": appearance.accentColor,
        } as React.CSSProperties
      }
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
