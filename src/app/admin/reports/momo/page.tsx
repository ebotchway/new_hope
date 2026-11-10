import { Smartphone, CheckCircle2, Clock, AlertTriangle, UserCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { ConfirmMomoButton } from "@/components/admin/confirm-momo-button";
import { requireStaff } from "@/lib/session";
import { getMobileMoneyReconciliationReport } from "@/lib/reports";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata = {
  title: "Ghana Mobile Money (MoMo) Reconciliation | LivingHope Admin",
};

export default async function MobileMoneyReconciliationPage() {
  await requireStaff();
  const data = await getMobileMoneyReconciliationReport();

  return (
    <div className="space-y-8 max-w-7xl">
      <ReportHeader
        title="Mobile Money (MoMo) Reconciliation"
        description="Authoritative audit of Ghana Mobile Money direct bank transfers, manual verifications, and statement reconciliation."
        breadcrumbs={[{ label: "MoMo Reconciliation" }]}
        exportType="momo"
        showPeriodSelector={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card border-amber-300/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
              Pending Verification
            </CardTitle>
            <Clock className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-amber-700 dark:text-amber-400">
              ₵{(data.pending.ghsCents / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.pending.count} transfer{data.pending.count === 1 ? "" : "s"} awaiting staff review
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Verified Realized GHS
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              ₵{(data.verified.ghsCents / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.verified.count} confirmed in operating account
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Verified USD Equivalent
            </CardTitle>
            <Smartphone className="size-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {formatMoney(data.verified.usdEquivalentCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Exchange rate tracked at pledge time
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Rejected Transfers
            </CardTitle>
            <AlertTriangle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.rejected.count}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ₵{(data.rejected.ghsCents / 100).toFixed(2)} unmatched or invalid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Verification Instructions Alert */}
      <Card className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20 p-5 text-sm text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="size-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Manual Bank Reconciliation Workflow</p>
            <p className="text-xs leading-relaxed opacity-90">
              When a donor selects Mobile Money, they receive an explicit Reference (e.g., <code>LH-KOF92</code>). Financial staff must inspect the Ghana MTN / Telecel corporate statement, match the reference code, and click <strong>Confirm Transfer</strong>. Confirming atomic transactions fulfills the sponsorship and automatically emails the tax receipt to the donor.
            </p>
          </div>
        </div>
      </Card>

      {/* MoMo Transactions Roster */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Mobile Money Reconciliation Ledger
            </h3>
            <p className="text-xs text-muted-foreground">Every MoMo transfer reference, phone number, expected GHS, and audit status</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase bg-muted/30">
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Donor & Phone</TableHead>
                <TableHead>Expected GHS</TableHead>
                <TableHead>USD Value</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reconciliation Audit</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-sm text-muted-foreground">
                    No Mobile Money transactions recorded.
                  </TableCell>
                </TableRow>
              ) : (
                data.records.map((m) => (
                  <TableRow key={m.id} className="text-xs hover:bg-muted/40">
                    <TableCell className="font-mono font-bold text-foreground">
                      {m.momoReference || m.id.slice(-8)}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(m.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{m.donorName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {m.donorPhone || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">
                      ₵{((m.amountGhsCents ?? 0) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {formatMoney(m.amountCents)}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {m.exchangeRate ? `1 USD = ${m.exchangeRate} GHS` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] uppercase ${
                          m.status === "SUCCEEDED"
                            ? "bg-emerald-600 text-white"
                            : m.status === "PENDING"
                              ? "bg-amber-500 text-white"
                              : "bg-destructive text-white"
                        }`}
                      >
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">
                      {m.momoVerifiedAt ? (
                        <div>
                          <div className="text-foreground font-medium flex items-center gap-1">
                            <UserCheck className="size-3 text-emerald-600" />
                            <span>{m.momoVerifiedBy || "Staff"}</span>
                          </div>
                          <div>{formatDate(m.momoVerifiedAt)}</div>
                        </div>
                      ) : m.momoRejectionReason ? (
                        <div className="text-destructive font-medium">
                          {m.momoRejectionReason}
                        </div>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 font-medium">
                          Awaiting statement match
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.status === "PENDING" && (
                        <ConfirmMomoButton id={m.id} />
                      )}
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
