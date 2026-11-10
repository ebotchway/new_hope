import Link from "next/link";
import {
  HandCoins,
  HeartHandshake,
  Smartphone,
  RefreshCw,
  Users2,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  FileText,
  Mail,
  Globe,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { ReportsChart } from "@/components/admin/reports/reports-chart";
import { requireStaff } from "@/lib/session";
import { getExecutiveReportingOverview } from "@/lib/reports";
import { formatMoney } from "@/lib/format";

export const metadata = {
  title: "Reports & Analytics Overview | LivingHope Admin",
};

export default async function ReportsOverviewPage() {
  await requireStaff();
  const data = await getExecutiveReportingOverview();

  const REPORT_MODULES = [
    {
      title: "Financial Reports",
      description: "Gross vs net revenue, payment gateway processing fees, native currency balances, and multi-period trends.",
      href: "/admin/reports/financial",
      icon: HandCoins,
      stat: formatMoney(data.realizedUsdCents),
      statLabel: "Realized Net USD",
    },
    {
      title: "Donation Ledger",
      description: "Itemized transaction ledger with multi-parameter filtering, search, and CSV export.",
      href: "/admin/reports/donations",
      icon: FileText,
      stat: `${data.realizedCount} gifts`,
      statLabel: "Realized Transactions",
    },
    {
      title: "Recurring Giving & Subscriptions",
      description: "Active monthly subscription retention, MRCV pacing, renewal success rates, and churn metrics.",
      href: "/admin/reports/recurring",
      icon: RefreshCw,
      stat: formatMoney(data.mrcvUsdCents) + "/mo",
      statLabel: "Active MRCV",
    },
    {
      title: "Sponsorship Operations",
      description: "Full vs partial sponsorship distribution, child coverage ratios, and guest vs registered donor pacing.",
      href: "/admin/reports/sponsorships",
      icon: HeartHandshake,
      stat: `${data.activeSponsorships} active`,
      statLabel: `${data.coverageRatio}% Coverage`,
    },
    {
      title: "Donors & Retention",
      description: "Donor lifecycle cohorts, first-time vs repeat donor rates, 90-day active retention, and giving tiers.",
      href: "/admin/reports/donors",
      icon: Users2,
      stat: "Cohort Analytics",
      statLabel: "Retention Tracking",
    },
    {
      title: "Beneficiary Reports",
      description: "Children under care, demographic distribution, educational enrollment, and progress updates status.",
      href: "/admin/reports/children",
      icon: GraduationCap,
      stat: `${data.availableChildren} available`,
      statLabel: `${data.sponsoredChildren} sponsored`,
    },
    {
      title: "Mobile Money Reconciliation",
      description: "Ghana MoMo statement matching, manual verification audit trail, and discrepancy flagging.",
      href: "/admin/reports/momo",
      icon: Smartphone,
      stat: data.pendingMomoCount > 0 ? `${data.pendingMomoCount} pending` : "Reconciled",
      statLabel: `₵${(data.pendingMomoGhsCents / 100).toFixed(2)} to review`,
      alert: data.pendingMomoCount > 0,
    },
    {
      title: "Payment Gateway Reconciliation",
      description: "Stripe Payment Intent and invoice reconciliation, duplicate detection, and webhook status tracking.",
      href: "/admin/reports/reconciliation",
      icon: ShieldCheck,
      stat: "Provider Audit",
      statLabel: "Stripe & Gateway",
    },
    {
      title: "Inquiries & Partnerships",
      description: "Corporate, church, and individual partnership lead intake, conversion rates, and response times.",
      href: "/admin/reports/inquiries",
      icon: Mail,
      stat: "Pipeline Audit",
      statLabel: "Inquiry Pacing",
    },
    {
      title: "Website & Content Reports",
      description: "CMS publication stats, scheduled release queues, missing SEO metadata, and media storage volume.",
      href: "/admin/reports/website",
      icon: Globe,
      stat: "CMS Analytics",
      statLabel: "Storage & Content",
    },
    {
      title: "Operational Audit Logs",
      description: "Comprehensive immutable audit trail of all staff actions, content revisions, and financial adjustments.",
      href: "/admin/reports/audit-logs",
      icon: History,
      stat: "Immutable Feed",
      statLabel: "System Security",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <ReportHeader
        title="Executive Reports & Analytics"
        description="Authoritative, persisted operational metrics and financial intelligence for LivingHope."
        showPeriodSelector={false}
      />

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card hover:border-brand-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Realized Cash (USD)
            </CardTitle>
            <HandCoins className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {formatMoney(data.realizedUsdCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {data.realizedCount} confirmed donations
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card hover:border-brand-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Realized Cash (GHS)
            </CardTitle>
            <Smartphone className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              ₵{(data.realizedGhsCents / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Verified Ghana Mobile Money transfers
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card hover:border-brand-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Active MRCV
            </CardTitle>
            <RefreshCw className="size-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {formatMoney(data.mrcvUsdCents)}
              <span className="text-xs font-normal text-muted-foreground">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {data.activeSponsorships} active recurring sponsorships
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card hover:border-brand-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Child Coverage Ratio
            </CardTitle>
            <HeartHandshake className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.coverageRatio}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.sponsoredChildren} sponsored · {data.availableChildren} awaiting sponsors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day Revenue Velocity Chart */}
      <ReportsChart
        data={data.velocityChart}
        currencySymbol="$"
        title="30-Day Fulfilled Donations Velocity"
      />

      {/* Specialized Reports Launch Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-foreground">
            Specialized Operational Reports
          </h2>
          <span className="text-xs text-muted-foreground">Authoritative persisted datasets</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REPORT_MODULES.map((mod) => (
            <Link key={mod.href} href={mod.href} className="group">
              <Card className="h-full rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-brand-primary/60 group-hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-secondary text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <mod.icon className="size-5" />
                  </div>
                  {mod.alert ? (
                    <Badge variant="destructive" className="text-xs">
                      Requires Action
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {mod.statLabel}
                    </Badge>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="font-heading font-bold text-base text-foreground group-hover:text-brand-primary transition-colors flex items-center justify-between">
                    <span>{mod.title}</span>
                    <ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-primary" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current Metric</span>
                  <span className="font-bold text-foreground">{mod.stat}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
