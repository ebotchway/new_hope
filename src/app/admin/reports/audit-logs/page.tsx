import { History, ShieldCheck, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Operational Audit Logs | LivingHope Admin",
};

export default async function AuditLogsReportPage() {
  await requireStaff();

  const [totalLogs, logs] = await Promise.all([
    prisma.cmsAuditLog.count(),
    prisma.cmsAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        page: { select: { title: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-7xl">
      <ReportHeader
        title="Operational & Administrative Audit Trail"
        description="Immutable chronological record of administrative actions, content modifications, and publishing events."
        breadcrumbs={[{ label: "Audit Logs" }]}
        showPeriodSelector={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Total Logged Events
            </CardTitle>
            <History className="size-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {totalLogs}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recorded in immutable database table
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Security Compliance
            </CardTitle>
            <ShieldCheck className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-emerald-600">
              Active
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Author identity verified per event
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Latest Activity
            </CardTitle>
            <UserCheck className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold font-heading text-foreground truncate">
              {logs[0]?.userName || "System"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {logs[0]?.action || "Initialization"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Recent Administrative Actions
            </h3>
            <p className="text-xs text-muted-foreground">Chronological log with user attribution, timestamp, and action type</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase bg-muted/30">
                <TableHead>Timestamp</TableHead>
                <TableHead>Author / User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Page / Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    No administrative audit events recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  let detailsStr = "";
                  if (log.details && typeof log.details === "object") {
                    try {
                      detailsStr = JSON.stringify(log.details);
                    } catch {
                      detailsStr = "";
                    }
                  }

                  return (
                    <TableRow key={log.id} className="text-xs hover:bg-muted/40">
                      <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {log.userName || log.user?.name || "System"}
                        </div>
                        {log.user?.email && (
                          <div className="text-[11px] text-muted-foreground">{log.user.email}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.page ? (
                          <div>
                            <span className="font-bold text-foreground">{log.page.title}</span>
                            <span className="text-[11px] text-muted-foreground ml-1 font-mono">
                              (/{log.page.slug})
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Global Configuration</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate font-mono text-[11px] text-muted-foreground">
                        {detailsStr || "—"}
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
