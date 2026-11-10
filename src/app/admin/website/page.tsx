import Link from "next/link";
import {
  Globe,
  Sparkles,
  FileText,
  Navigation,
  Image as ImageIcon,
  Palette,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Website Management | LivingHope Admin",
};

export default async function WebsiteOverviewPage() {
  await requireStaff();

  const [
    totalPages,
    publishedPages,
    totalMedia,
    recentAudits,
    homePage,
  ] = await Promise.all([
    prisma.cmsPage.count(),
    prisma.cmsPage.count({ where: { status: "PUBLISHED" } }),
    prisma.cmsMediaAsset.count(),
    prisma.cmsAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.cmsPage.findUnique({
      where: { slug: "home" },
      include: {
        revisions: {
          orderBy: { revisionNumber: "desc" },
          take: 1,
        },
      },
    }),
  ]);

  const cards = [
    {
      title: "Homepage Builder",
      description: "Reorder sections, update hero headlines, choose featured children, and customize CTAs.",
      href: "/admin/website/homepage",
      icon: Sparkles,
      action: "Open Builder",
    },
    {
      title: "Pages Manager",
      description: "Create, edit, and publish content pages with draft and revision control.",
      href: "/admin/website/pages",
      icon: FileText,
      action: "Manage Pages",
    },
    {
      title: "Navigation & Menus",
      description: "Configure main navigation bar links, dropdowns, and footer information columns.",
      href: "/admin/website/navigation",
      icon: Navigation,
      action: "Configure Menus",
    },
    {
      title: "Media Library",
      description: "Upload and organize photos, banners, and logos with alt text and format validation.",
      href: "/admin/website/media",
      icon: ImageIcon,
      action: "Open Library",
    },
    {
      title: "Appearance & Branding",
      description: "Customize brand colors, typography pairings, container widths, and button styling.",
      href: "/admin/website/appearance",
      icon: Palette,
      action: "Edit Branding",
    },
    {
      title: "SEO & Social",
      description: "Set default search engine meta tags, Open Graph preview cards, and social links.",
      href: "/admin/website/seo",
      icon: Search,
      action: "Manage SEO",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Website Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control public website content, layouts, branding, and media publishing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/" target="_blank" className="flex items-center gap-2">
              <Globe className="size-4" />
              <span>View Live Website</span>
            </Link>
          </Button>
          <Button asChild className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover">
            <Link href="/admin/website/homepage" className="flex items-center gap-2">
              <Sparkles className="size-4" />
              <span>Launch Homepage Builder</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric summary counters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CMS Pages</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPages}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {publishedPages} published, {totalPages - publishedPages} draft
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Media Assets</CardTitle>
            <ImageIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMedia}</div>
            <p className="text-xs text-muted-foreground mt-1">Stored in centralized library</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Homepage Status</CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {homePage?.status || "LIVE"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revision #{homePage?.revisions[0]?.revisionNumber || 1}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Routing</CardTitle>
            <ShieldCheck className="size-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Protected</div>
            <p className="text-xs text-muted-foreground mt-1">Reserved paths guarded</p>
          </CardContent>
        </Card>
      </div>

      {/* Module quick launch grid */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4 font-heading">Management Modules</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="group relative overflow-hidden rounded-2xl border-border/60 bg-card p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-heading">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
                <div className="mt-6 pt-4 border-t border-border/50">
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover"
                  >
                    <span>{card.action}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Publishing & Audit Activity */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold font-heading flex items-center gap-2">
            <Clock className="size-5 text-muted-foreground" />
            <span>Recent CMS Activity & Audit Trail</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAudits.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No recent website modifications logged.
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {recentAudits.map((audit) => (
                <div key={audit.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {audit.action}
                      </Badge>
                      <span className="font-medium text-foreground">
                        {audit.userName || "System"}
                      </span>
                    </div>
                    {audit.details && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {JSON.stringify(audit.details)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(audit.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

