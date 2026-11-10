import { RefreshCw, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { requireStaff } from "@/lib/session";
import { getRecurringGivingReport } from "@/lib/reports";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata = {
  title: "Recurring Giving & Subscriptions | LivingHope Admin",
};

export default async function RecurringGivingReportPage() {
  await requireStaff();
  const data = await getRecurringGivingReport();

  return (
    <div className="space-y-8 max-w-7xl">
      <ReportHeader
        title="Recurring Giving & Monthly Sponsorship Subscriptions"
        description="Comprehensive audit of recurring commitments, monthly realized cash pacing, and donor retention."
        breadcrumbs={[{ label: "Recurring Giving" }]}
        exportType="sponsorships"
        showPeriodSelector={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
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
              Monthly Recurring Contribution Value
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Active Subscriptions
            </CardTitle>
            <Users className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.activeSubscriptionsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.uniqueActiveSubscribersEstimate} unique recurring donors
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Retention Rate
            </CardTitle>
            <TrendingUp className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.retentionRatePercent}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.endedSubscriptionsCount} historical cancellations recorded
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Renewals Fulfilled
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.totalSuccessfulRenewalsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Automated recurring payments cleared
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown Explanation */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5">
        <h3 className="font-heading font-bold text-base text-foreground mb-2">
          Recurring Giving Methodology & Financial Modeling
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Monthly Recurring Contribution Value (MRCV) reflects authorized active monthly pledges. To ensure absolute financial integrity, speculative future renewals are not counted as realized revenue; only cleared recurring invoices are recognized in the financial statements.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground">Active Subscriptions</span>
            <p className="text-lg font-bold text-emerald-600">{data.activeSubscriptionsCount}</p>
            <span className="text-[11px] text-muted-foreground">Billing automatically each month</span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Paused Subscriptions</span>
            <p className="text-lg font-bold text-amber-600">{data.pausedSubscriptionsCount}</p>
            <span className="text-[11px] text-muted-foreground">Temporarily suspended by donor</span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Ended / Cancelled</span>
            <p className="text-lg font-bold text-muted-foreground">{data.endedSubscriptionsCount}</p>
            <span className="text-[11px] text-muted-foreground">Historical records preserved</span>
          </div>
        </div>
      </Card>

      {/* Recent Renewals Table */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Recent Subscription Renewal Invoices
            </h3>
            <p className="text-xs text-muted-foreground">Automated monthly transactions cleared through Stripe</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Monthly Amount</TableHead>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentRenewals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                    No recurring subscription donations recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.recentRenewals.map((r) => (
                  <TableRow key={r.id} className="text-xs hover:bg-muted/40">
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{r.donorName}</div>
                      <div className="text-[11px] text-muted-foreground">{r.donorEmail}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        {r.child?.name || "General Program"}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">
                      {formatMoney(r.amountCents)}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {r.stripeInvoiceId || r.stripeSubscriptionId || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] uppercase ${
                          r.status === "SUCCEEDED"
                            ? "bg-emerald-600 text-white"
                            : r.status === "PENDING"
                              ? "bg-amber-500 text-white"
                              : "bg-destructive text-white"
                        }`}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
