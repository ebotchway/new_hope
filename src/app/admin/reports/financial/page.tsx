import Link from "next/link";
import {
  HandCoins,
  CreditCard,
  Smartphone,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { requireStaff } from "@/lib/session";
import { getFinancialReport } from "@/lib/reports";
import { formatMoney, formatDate } from "@/lib/format";
import type { PaymentMethod } from "@/generated/prisma/enums";

export const metadata = {
  title: "Financial Reports & Revenue Intelligence | LivingHope Admin",
};

interface FinancialPageProps {
  searchParams: Promise<{
    period?: "today" | "7d" | "30d" | "this_month" | "last_month" | "this_quarter" | "this_year" | "all_time";
    method?: PaymentMethod;
    currency?: string;
  }>;
}

export default async function FinancialReportsPage(props: FinancialPageProps) {
  await requireStaff();
  const searchParams = await props.searchParams;

  const data = await getFinancialReport({
    period: searchParams.period,
    paymentMethod: searchParams.method,
    currency: searchParams.currency,
  });

  return (
    <div className="space-y-8 max-w-7xl">
      <ReportHeader
        title="Financial Reports & Revenue Audit"
        description={`Authoritative revenue metrics for ${data.periodLabel}. Explicit native currency balances with fee tracking.`}
        breadcrumbs={[{ label: "Financial Reports" }]}
        exportType="donations"
      />

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Gross Revenue (USD)
            </CardTitle>
            <HandCoins className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {formatMoney(data.totals.grossUsdCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.counts.succeeded} successful gifts received
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Refunds Issued (USD)
            </CardTitle>
            <RotateCcw className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {formatMoney(data.totals.refundedUsdCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.counts.refunded} refunded transactions
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Estimated Gateway Fees
            </CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {formatMoney(data.totals.estimatedStripeFeesCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Stripe 2.9% + $0.30 charity estimate
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card border-brand-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-brand-primary uppercase tracking-wide">
              Net Settled Revenue (USD)
            </CardTitle>
            <CheckCircle2 className="size-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-brand-primary">
              {formatMoney(data.totals.netUsdAfterFeesCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gross minus refunds & estimated fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Native Currencies & Payment Providers Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Payments (Stripe USD) */}
        <Card className="rounded-2xl border border-border/80 bg-card p-5">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <CreditCard className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">
                  Stripe Card Payments (USD)
                </h3>
                <p className="text-xs text-muted-foreground">International & Domestic Credit/Debit Cards</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              USD ($)
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Successful Card Volume</span>
              <p className="text-xl font-bold font-heading text-foreground">
                {formatMoney(data.totals.grossUsdCents)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Card Transactions Count</span>
              <p className="text-xl font-bold font-heading text-foreground">
                {data.counts.card}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Estimated Provider Fees</span>
              <p className="text-base font-semibold text-muted-foreground">
                {formatMoney(data.totals.estimatedStripeFeesCents)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Net Card Payout</span>
              <p className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                {formatMoney(data.totals.netUsdAfterFeesCents)}
              </p>
            </div>
          </div>
        </Card>

        {/* Mobile Money (MTN/Telecel GHS) */}
        <Card className="rounded-2xl border border-border/80 bg-card p-5">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Smartphone className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">
                  Ghana Mobile Money (GHS)
                </h3>
                <p className="text-xs text-muted-foreground">Direct MTN, Telecel, AirtelTigo Wallets</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs border-amber-300 text-amber-800 dark:text-amber-300">
              GHS (₵)
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Realized MoMo Volume</span>
              <p className="text-xl font-bold font-heading text-foreground">
                ₵{(data.totals.realizedGhsCents / 100).toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Verified Transfers Count</span>
              <p className="text-xl font-bold font-heading text-foreground">
                {data.counts.momo}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Estimated Gateway (1%)</span>
              <p className="text-base font-semibold text-muted-foreground">
                ₵{(data.totals.estimatedMomoFeesGhsCents / 100).toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Pending Reconciliation</span>
              <p className="text-base font-semibold text-amber-700 dark:text-amber-400">
                ₵{(data.totals.pendingGhsCents / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Realized vs Commitments Pacing */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5">
        <h3 className="font-heading font-bold text-base text-foreground mb-3">
          Cash Receipts vs Pending Commitments Analysis
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Strict accounting distinction: Pending Mobile Money transfers are tracked separately and not counted in net cash receipts until human bank statement reconciliation is confirmed.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase">
              <CheckCircle2 className="size-4" />
              <span>Fulfilled Cash (Realized)</span>
            </div>
            <div className="text-xl font-bold font-heading text-foreground mt-2">
              {formatMoney(data.totals.grossUsdCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              100% verified settlement in operating bank accounts
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-950 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase">
              <Clock className="size-4" />
              <span>Pending Transfers (Awaiting Verification)</span>
            </div>
            <div className="text-xl font-bold font-heading text-foreground mt-2">
              {formatMoney(data.totals.pendingUsdCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              ₵{(data.totals.pendingGhsCents / 100).toFixed(2)} in unconfirmed MoMo claims
            </p>
          </div>

          <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 dark:border-red-950 dark:bg-red-950/20">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-300 text-xs font-bold uppercase">
              <AlertTriangle className="size-4" />
              <span>Failed Payment Attempts</span>
            </div>
            <div className="text-xl font-bold font-heading text-foreground mt-2">
              {formatMoney(data.totals.failedUsdCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.counts.failed} card or network rejections
            </p>
          </div>
        </div>
      </Card>

      {/* Itemized Transactions Sample */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Recent Transactions Ledger
            </h3>
            <p className="text-xs text-muted-foreground">Itemized audit entries with payment method and child linkage</p>
          </div>
          <Link
            href="/admin/reports/donations"
            className="text-xs font-medium text-brand-primary hover:underline flex items-center gap-1"
          >
            <span>Full Ledger</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    No transactions recorded matching the selected filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                data.recentTransactions.map((tx) => (
                  <TableRow key={tx.id} className="text-xs hover:bg-muted/40">
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{tx.donorName}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                        {tx.donorEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {tx.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">
                      {formatMoney(tx.amountCents)}
                      {tx.amountGhsCents && (
                        <div className="text-[10px] font-normal text-muted-foreground">
                          ₵{(tx.amountGhsCents / 100).toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground truncate">
                        {tx.child?.name ? `Child: ${tx.child.name}` : tx.designation}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] uppercase ${
                          tx.status === "SUCCEEDED"
                            ? "bg-emerald-600 text-white"
                            : tx.status === "PENDING"
                              ? "bg-amber-500 text-white"
                              : tx.status === "REFUNDED"
                                ? "bg-muted text-foreground border"
                                : "bg-destructive text-white"
                        }`}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {tx.momoReference || tx.stripeInvoiceId || tx.stripePaymentIntentId || tx.id.slice(-8)}
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

