import Link from "next/link";
import { Mail, Church, Clock, Sparkles } from "lucide-react";
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

  const [
    totalInquiries,
    newInquiries,
    brightenerRegistrations,
    generalInquiries,
    inquiriesList,
    typeCounts,
  ] = await Promise.all([
    prisma.partnershipInquiry.count(),
    prisma.partnershipInquiry.count({ where: { status: "NEW" } }),
    prisma.partnershipInquiry.count({ where: { category: "BRIGHTENER_REGISTRATION" } }),
    prisma.partnershipInquiry.count({ where: { category: "GENERAL_INQUIRY" } }),
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
        title="Inquiries & Brightener Pipeline Analytics"
        description="Comprehensive audit of Brightener registrations, volunteers, corporate initiatives, and public contact desk inquiries."
        breadcrumbs={[{ label: "Inquiries Pipeline" }]}
        showPeriodSelector={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Total Submissions
            </CardTitle>
            <Mail className="size-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {totalInquiries}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {brightenerRegistrations} Brighteners · {generalInquiries} General
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
              Submissions requiring initial outreach
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Brighteners & Volunteers
            </CardTitle>
            <Sparkles className="size-4 text-brand-gold-dark" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {brightenerRegistrations}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active registered change-makers
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Corporate & Faith Partners
            </CardTitle>
            <Church className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {(typeMap["CORPORATE"] ?? 0) + (typeMap["CHURCH"] ?? 0) + (typeMap["FOUNDATION"] ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Institutional community alliances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Breakdown */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5">
        <h3 className="font-heading font-bold text-base text-foreground mb-3">
          Submissions by Classification & Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-secondary/50 space-y-1">
            <span className="text-muted-foreground">Individual Brighteners</span>
            <p className="text-lg font-bold text-foreground">{typeMap["INDIVIDUAL"] ?? 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 space-y-1">
            <span className="text-blue-700 dark:text-blue-400">Volunteers</span>
            <p className="text-lg font-bold">{typeMap["VOLUNTEER"] ?? 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300 space-y-1">
            <span className="text-purple-700 dark:text-purple-400">Corporate Partners</span>
            <p className="text-lg font-bold">{typeMap["CORPORATE"] ?? 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 space-y-1">
            <span className="text-emerald-700 dark:text-emerald-400">Churches & Ministries</span>
            <p className="text-lg font-bold">{typeMap["CHURCH"] ?? 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 space-y-1">
            <span className="text-amber-700 dark:text-amber-400">Legacy / Will Gifts</span>
            <p className="text-lg font-bold">{typeMap["WILL_GIFT"] ?? 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 space-y-1">
            <span className="text-rose-700 dark:text-rose-400">General Inquiries</span>
            <p className="text-lg font-bold">{generalInquiries}</p>
          </div>
        </div>
      </Card>

      {/* Inquiries Ledger Table */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Recent Submissions Roster
            </h3>
            <p className="text-xs text-muted-foreground">Prospective partner submissions with contact, category, and status tracking</p>
          </div>
          <Link
            href="/admin/inquiries"
            className="text-xs font-medium text-brand-primary hover:underline"
          >
            Manage Inquiries &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40">
                <TableHead>Contact</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Summary / Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiriesList.map((inq) => (
                <TableRow key={inq.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium text-foreground">
                    <div>{inq.name}</div>
                    <div className="text-xs text-muted-foreground">{inq.email}</div>
                    {inq.organization && (
                      <div className="text-[11px] text-brand-navy dark:text-blue-300 font-medium">
                        {inq.organization}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        inq.category === "BRIGHTENER_REGISTRATION"
                          ? "border-brand-navy/30 bg-brand-navy/10 text-brand-navy"
                          : "border-border bg-secondary text-muted-foreground"
                      }
                    >
                      {inq.category === "BRIGHTENER_REGISTRATION" ? "Brightener" : "Contact Desk"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {inq.type.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="max-w-xs text-xs text-muted-foreground truncate">
                    {inq.subject ? `[${inq.subject}] ` : ""}
                    {inq.message || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        inq.status === "NEW"
                          ? "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : inq.status === "CONTACTED"
                            ? "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                            : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }
                    >
                      {inq.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(inq.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {inquiriesList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                    No submissions recorded.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
