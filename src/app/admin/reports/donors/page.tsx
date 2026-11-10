import { Users2, Repeat, Clock, Award, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { requireStaff } from "@/lib/session";
import { getDonorReport } from "@/lib/reports";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata = {
  title: "Donor Analytics & Retention Reports | LivingHope Admin",
};

export default async function DonorReportsPage() {
  await requireStaff();
  const data = await getDonorReport();

  return (
    <div className="space-y-8 max-w-7xl">
      <ReportHeader
        title="Donor Analytics & Retention Intelligence"
        description="Comprehensive audit of donor cohorts, repeat giving rates, giving tiers, and lifetime contribution."
        breadcrumbs={[{ label: "Donors & Retention" }]}
        exportType="donors"
        showPeriodSelector={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Total Distinct Donors
            </CardTitle>
            <Users2 className="size-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.totalDistinctDonors}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.registeredUsersCount} registered portal accounts
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Repeat Donor Rate
            </CardTitle>
            <Repeat className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.repeatDonorRatePercent}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.repeatDonorsCount} multi-gift donors · {data.firstTimeDonorsCount} first-time
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Active in 90 Days
            </CardTitle>
            <Clock className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.activeIn90DaysCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Contributed within past 3 months
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Lapsed Donors
            </CardTitle>
            <Heart className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.lapsedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              No gift recorded in over 90 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Giving Tiers Breakdown */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5">
        <h3 className="font-heading font-bold text-base text-foreground mb-3 flex items-center gap-2">
          <Award className="size-5 text-brand-primary" />
          <span>Lifetime Giving Tier Segmentation</span>
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Segmentation based on cumulative realized donations in database history.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 dark:border-purple-950 dark:bg-purple-950/20 space-y-1">
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">Major Givers ($1,000+)</span>
            <p className="text-2xl font-bold font-heading text-foreground">{data.tiers.major1000Plus}</p>
            <span className="text-[11px] text-muted-foreground">High-impact supporters</span>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-950 dark:bg-blue-950/20 space-y-1">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Mid-Level ($500 – $999)</span>
            <p className="text-2xl font-bold font-heading text-foreground">{data.tiers.mid500to999}</p>
            <span className="text-[11px] text-muted-foreground">Dedicated sponsors</span>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20 space-y-1">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Regular Givers ($100 – $499)</span>
            <p className="text-2xl font-bold font-heading text-foreground">{data.tiers.regular100to499}</p>
            <span className="text-[11px] text-muted-foreground">Recurring contributors</span>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-secondary/40 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">Grassroots (&lt; $100)</span>
            <p className="text-2xl font-bold font-heading text-foreground">{data.tiers.grassrootsUnder100}</p>
            <span className="text-[11px] text-muted-foreground">Entry & community donors</span>
          </div>
        </div>
      </Card>

      {/* Top Donors Roster */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Top Donors by Lifetime Contribution
            </h3>
            <p className="text-xs text-muted-foreground">Individual lifetime cumulative volume (Privacy protected: emails truncated in staff exports)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase bg-muted/30">
                <TableHead>Donor Email</TableHead>
                <TableHead>Total Gifts</TableHead>
                <TableHead>Lifetime Realized Volume</TableHead>
                <TableHead>Latest Gift</TableHead>
                <TableHead>Cohort Segment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topDonors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    No donor contributions recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.topDonors.map((d) => (
                  <TableRow key={d.email} className="text-xs hover:bg-muted/40">
                    <TableCell className="font-medium text-foreground">
                      {d.email}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">
                      {d.giftCount}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {formatMoney(d.totalContributedCents)}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(d.latestGiftAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          d.giftCount > 1
                            ? "border-emerald-300 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {d.giftCount > 1 ? "Repeat Donor" : "First-Time"}
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
