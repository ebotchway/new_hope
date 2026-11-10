import { ShieldCheck, CheckCircle2, AlertTriangle, CreditCard, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { requireStaff } from "@/lib/session";
import { getPaymentReconciliationAudit } from "@/lib/reports";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata = {
  title: "Payment Gateway Reconciliation | LivingHope Admin",
};

export default async function PaymentReconciliationPage() {
  await requireStaff();
  const data = await getPaymentReconciliationAudit();

  return (
    <div className="space-y-8 max-w-7xl">
      <ReportHeader
        title="Payment Gateway Reconciliation Audit"
        description="Authoritative audit matching internal donation records with Stripe checkout sessions, payment intents, and recurring invoice IDs."
        breadcrumbs={[{ label: "Payment Audit" }]}
        showPeriodSelector={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Audited Card Donations
            </CardTitle>
            <CreditCard className="size-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.totalCardDonations}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Internal ledger records with gateway IDs
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Duplicate Invoices
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-emerald-600">
              {data.duplicateInvoicesCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Protected by unique constraint
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Missing Invoices (Recurring)
            </CardTitle>
            {data.missingInvoiceRecords > 0 ? (
              <AlertTriangle className="size-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="size-4 text-emerald-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-heading ${data.missingInvoiceRecords > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {data.missingInvoiceRecords}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly gifts missing invoice reference
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Abandoned Checkouts (&gt;24h)
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {data.abandonedCheckoutCandidates}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions opened but never completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gateway Architecture Security Note */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5">
        <h3 className="font-heading font-bold text-base text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-600" />
          <span>Stripe Webhook & Transactional Idempotency Standard</span>
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The LivingHope payment pipeline implements strict multi-invoice recurring modeling. Every webhook event is verified against the Stripe signing secret (<code>STRIPE_WEBHOOK_SECRET</code>), deduplicated via unique <code>stripeInvoiceId</code>, and fulfilled within database transactions. Even in the event of upstream network retries or transient email provider outages, donations are never fulfilled twice.
        </p>
      </Card>

      {/* Card Ledger Table */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Payment Gateway Ledger Sample
            </h3>
            <p className="text-xs text-muted-foreground">Internal transactions matched against Stripe Session, Intent, and Invoice IDs</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stripe Payment Intent</TableHead>
                <TableHead>Stripe Invoice ID</TableHead>
                <TableHead>Stripe Subscription ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.ledger.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    No card payments recorded in database.
                  </TableCell>
                </TableRow>
              ) : (
                data.ledger.map((item) => (
                  <TableRow key={item.id} className="text-xs hover:bg-muted/40">
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{item.donorName}</div>
                      <div className="text-[11px] text-muted-foreground">{item.donorEmail}</div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">
                      {formatMoney(item.amountCents)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] uppercase ${
                          item.status === "SUCCEEDED"
                            ? "bg-emerald-600 text-white"
                            : item.status === "PENDING"
                              ? "bg-amber-500 text-white"
                              : "bg-destructive text-white"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {item.stripePaymentIntentId || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {item.stripeInvoiceId || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {item.stripeSubscriptionId || "—"}
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
