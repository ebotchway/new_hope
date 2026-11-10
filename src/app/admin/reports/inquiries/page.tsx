import Link from "next/link";
import { Mail, Building2, Church, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Inquiries & Partnerships Pipeline | LivingHope Admin",
};

export default async function InquiriesReportPage() {
  await requireStaff();

  const [totalInquiries, newInquiries, inquiriesList, typeCounts] = await Promise.all([
    prisma.partnershipInquiry.count(),
    prisma.partnershipInquiry.count({ where: { status: "NEW" } }),
    prisma.partnershipInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.partnershipInquiry.groupBy({
      by: ["type"],
      _count: { id: true },
    }),
  ]);

  const typeMap: Record<string, number> = {};
  for (const t of typeCounts) {
    typeMap[t.type] = t._count.id;
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <ReportHeader
        title="Partnership & Inquiry Pipeline Analytics"
        description="Comprehensive audit of corporate, institutional, and individual partnership inquiries."
        breadcrumbs={[{ label: "Inquiries Pipeline" }]}
        showPeriodSelector={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Total Inquiries
            </CardTitle>
            <Mail className="size-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {totalInquiries}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Historical partnership submissions
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card border-amber-300/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
              New Leads Awaiting Contact
            </CardTitle>
            <Clock className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-amber-700 dark:text-amber-400">
              {newInquiries}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads requiring initial outreach
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Corporate & Foundation
            </CardTitle>
            <Building2 className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {(typeMap["CORPORATE"] ?? 0) + (typeMap["FOUNDATION"] ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Institutional grant & CSR partners
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Churches & Faith Groups
            </CardTitle>
            <Church className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {typeMap["CHURCH"] ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Congregational sponsorship initiatives
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Breakdown */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5">
        <h3 className="font-heading font-bold text-base text-foreground mb-3">
          Inquiries by Partnership Type
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-secondary/50 space-y-1">
            <span className="text-muted-foreground">Corporate CSR</span>
            <p className="text-lg font-bold text-foreground">{typeMap["CORPORATE"] ?? 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300 space-y-1">
            <span className="text-purple-700 dark:text-purple-400">Churches & Ministries</span>
            <p className="text-lg font-bold">{typeMap["CHURCH"] ?? 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 space-y-1">
            <span className="text-blue-700 dark:text-blue-400">Schools & Universities</span>
            <p className="text-lg font-bold">{typeMap["SCHOOL"] ?? 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 space-y-1">
            <span className="text-emerald-700 dark:text-emerald-400">Foundations</span>
            <p className="text-lg font-bold">{typeMap["FOUNDATION"] ?? 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 space-y-1">
            <span className="text-amber-700 dark:text-amber-400">Individual Advocates</span>
            <p className="text-lg font-bold">{typeMap["INDIVIDUAL"] ?? 0}</p>
          </div>
        </div>
      </Card>

      {/* Inquiries Ledger Table */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Recent Partnership Inquiries Roster
            </h3>
            <p className="text-xs text-muted-foreground">Prospective partner submissions with contact and status tracking</p>
          </div>
          <Link
            href="/admin/inquiries"
            className="text-xs font-medium text-brand-primary hover:underline"
          >
            Inquiry Management →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message Note</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiriesList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    No partnership inquiries currently recorded.
                  </TableCell>
                </TableRow>
              ) : (
                inquiriesList.map((inq) => (
                  <TableRow key={inq.id} className="text-xs hover:bg-muted/40">
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(inq.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{inq.name}</div>
                      <div className="text-[11px] text-muted-foreground">{inq.email}</div>
                      {inq.phone && (
                        <div className="text-[10px] text-muted-foreground font-mono">{inq.phone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {inq.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md text-muted-foreground truncate">
                      {inq.message || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] uppercase ${
                          inq.status === "NEW"
                            ? "bg-amber-500 text-white"
                            : inq.status === "CONTACTED"
                              ? "bg-blue-600 text-white"
                              : inq.status === "CLOSED"
                                ? "bg-emerald-600 text-white"
                                : "bg-muted text-foreground border"
                        }`}
                      >
                        {inq.status}
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
