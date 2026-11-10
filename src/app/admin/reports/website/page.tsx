import { Globe, FileText, ImageIcon, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { requireStaff } from "@/lib/session";
import { getWebsiteContentReport } from "@/lib/reports";

export const metadata = {
  title: "Website Content & CMS Health Report | LivingHope Admin",
};

export default async function WebsiteContentReportPage() {
  await requireStaff();
  const data = await getWebsiteContentReport();

  return (
    <div className="space-y-8 max-w-7xl">
      <ReportHeader
        title="Website Content & CMS Storage Analytics"
        description="Comprehensive audit of published pages, revision versions, media assets, storage consumption, and accessibility alt text."
        breadcrumbs={[{ label: "Content Reports" }]}
        showPeriodSelector={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Published Pages
            </CardTitle>
            <Globe className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.pages.published}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live in navigation · {data.pages.scheduled} scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Draft & Archived
            </CardTitle>
            <FileText className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.pages.draft} Draft · {data.pages.archived} Archived
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.pages.total} total managed pages
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Media Assets
            </CardTitle>
            <ImageIcon className="size-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.media.totalAssets}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all managed media folders
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Media Storage Used
            </CardTitle>
            <HardDrive className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.media.storageMb} MB
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optimized WebP, PNG, JPG files
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Media & Accessibility Health Card */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5">
        <h3 className="font-heading font-bold text-base text-foreground mb-3">
          Media Folder Breakdown & Accessibility Audit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Folders */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Media Assets by Folder
            </h4>
            <div className="space-y-2">
              {Object.keys(data.media.folderDistribution).length === 0 ? (
                <p className="text-xs text-muted-foreground">No media assets recorded in database.</p>
              ) : (
                Object.entries(data.media.folderDistribution).map(([folder, count]) => (
                  <div
                    key={folder}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 text-xs"
                  >
                    <span className="font-semibold capitalize text-foreground">{folder}</span>
                    <Badge variant="secondary">{count} assets</Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Alt text accessibility */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Accessibility (WCAG 2.1 AA) Compliance
            </h4>
            <div className="p-4 rounded-xl border border-border/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Missing Image Alt Text:</span>
                <span className={`font-bold ${data.media.missingAltTextCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  {data.media.missingAltTextCount} assets
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Total Revisions Preserved:</span>
                <span className="font-bold text-foreground">{data.totalRevisions} revisions</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                All public image renders enforce fallback descriptive alt text when unassigned by editors.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Traffic Analytics Truthfulness Note */}
      <Card className="rounded-2xl border border-blue-200 bg-blue-50/50 dark:border-blue-950 dark:bg-blue-950/20 p-5 text-sm text-blue-900 dark:text-blue-200">
        <div className="flex items-start gap-3">
          <Globe className="size-5 shrink-0 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Honest Analytics & Privacy Standard</p>
            <p className="text-xs leading-relaxed opacity-90">
              In accordance with charity transparency standards, LivingHope does not generate simulated or fabricated page views, bounce rates, or visitor counts. To integrate privacy-compliant website analytics, configure your Google Analytics 4, Plausible, or Umami measurement ID in the Appearance &amp; SEO settings.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
