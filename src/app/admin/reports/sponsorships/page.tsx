import { HeartHandshake, Users2, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { SponsorshipStatusSelect } from "@/components/admin/sponsorship-status-select";
import { requireStaff } from "@/lib/session";
import { getSponsorshipReport } from "@/lib/reports";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata = {
  title: "Sponsorship Operations Report | LivingHope Admin",
};

export default async function SponsorshipReportPage() {
  await requireStaff();
  const data = await getSponsorshipReport();

  return (
    <div className="space-y-8 max-w-7xl">
      <ReportHeader
        title="Sponsorship Operations & Beneficiary Coverage"
        description="Comprehensive audit of active child sponsorships, sponsor demographics, and coverage ratios."
        breadcrumbs={[{ label: "Sponsorships" }]}
        exportType="sponsorships"
        showPeriodSelector={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Child Coverage Ratio
            </CardTitle>
            <HeartHandshake className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.children.coverageRatioPercent}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.children.sponsored} of {data.children.sponsored + data.children.available} enrolled children
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Active Sponsorships
            </CardTitle>
            <Users2 className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.sponsorships.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.sponsorships.fullTiers} Full ($45/mo) · {data.sponsorships.partialTiers} Contribution
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Registered Sponsors
            </CardTitle>
            <UserCheck className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.sponsorships.registeredSponsorsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Logged in through donor portal
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Guest Sponsors
            </CardTitle>
            <UserX className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.sponsorships.guestSponsorsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Direct checkout with email contact
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Beneficiaries Status Roster */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5">
        <h3 className="font-heading font-bold text-base text-foreground mb-3">
          Beneficiary Capacity & Program Enrollment
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-secondary/50 space-y-1">
            <span className="text-muted-foreground">Total In System</span>
            <p className="text-lg font-bold text-foreground">{data.children.total}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300 space-y-1">
            <span className="text-purple-700 dark:text-purple-400">Currently Sponsored</span>
            <p className="text-lg font-bold">{data.children.sponsored}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 space-y-1">
            <span className="text-emerald-700 dark:text-emerald-400">Awaiting Sponsors</span>
            <p className="text-lg font-bold">{data.children.available}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 space-y-1">
            <span className="text-blue-700 dark:text-blue-400">Graduated</span>
            <p className="text-lg font-bold">{data.children.graduated}</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/60 space-y-1">
            <span className="text-muted-foreground">Archived Profiles</span>
            <p className="text-lg font-bold text-muted-foreground">{data.children.archived}</p>
          </div>
        </div>
      </Card>

      {/* Active Sponsorships Table */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Active Sponsorship Relationships
            </h3>
            <p className="text-xs text-muted-foreground">Direct link between donor commitments and sponsored children</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase bg-muted/30">
                <TableHead>Start Date</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Location & School</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Pledge</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sponsorshipsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                    No active sponsorships recorded in the database.
                  </TableCell>
                </TableRow>
              ) : (
                data.sponsorshipsList.map((sp) => {
                  const sponsorName = sp.user?.name || sp.guestName || "Anonymous";
                  const sponsorEmail = sp.user?.email || sp.guestEmail || "";

                  return (
                    <TableRow key={sp.id} className="text-xs hover:bg-muted/40">
                      <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                        {formatDate(sp.startDate)}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-foreground">{sp.child.name}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sp.child.school || sp.child.location || "Accra, Ghana"}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{sponsorName}</div>
                        <div className="text-[11px] text-muted-foreground">{sponsorEmail}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {sp.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-foreground">
                        {formatMoney(sp.monthlyAmountCents)}
                        <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[10px] uppercase ${
                            sp.status === "ACTIVE"
                              ? "bg-emerald-600 text-white"
                              : sp.status === "PAUSED"
                                ? "bg-amber-500 text-white"
                                : "bg-muted text-foreground border"
                          }`}
                        >
                          {sp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <SponsorshipStatusSelect id={sp.id} status={sp.status} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
