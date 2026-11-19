import Link from "next/link";
import { Smartphone, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DonationActions } from "@/components/admin/donation-actions";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/format";
import type { DonationStatus, PaymentMethod } from "@/generated/prisma/enums";

export const metadata = { title: "Donation Ledger — LivingHope Admin" };

const STATUS_VARIANT: Record<DonationStatus, string> = {
  SUCCEEDED: "bg-emerald-600 text-white dark:bg-emerald-700",
  PENDING: "bg-amber-500 text-white dark:bg-amber-600",
  FAILED: "bg-destructive text-white",
  REFUNDED: "bg-muted text-foreground border",
};

export default async function AdminDonationsPage(props: PageProps<"/admin/donations">) {
  await requireStaff();

  const searchParams = await props.searchParams;
  const statusParam = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const methodParam = typeof searchParams.method === "string" ? searchParams.method : undefined;

  const whereClause: {
    status?: DonationStatus;
    paymentMethod?: PaymentMethod;
  } = {};

  if (statusParam && ["SUCCEEDED", "PENDING", "FAILED", "REFUNDED"].includes(statusParam)) {
    whereClause.status = statusParam as DonationStatus;
  }

  if (methodParam && ["CARD", "MOBILE_MONEY"].includes(methodParam)) {
    whereClause.paymentMethod = methodParam as PaymentMethod;
  }

  const [donations, totalSucceeded, pendingMomoCount] = await Promise.all([
    prisma.donation.findMany({
      where: whereClause,
      include: { child: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.donation.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amountCents: true },
    }),
    prisma.donation.count({
      where: { status: "PENDING", paymentMethod: "MOBILE_MONEY" },
    }),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Donations & Financial Ledger"
        description={`Total reconciled funds: ${formatMoney(totalSucceeded._sum.amountCents ?? 0)}`}
        breadcrumbs={[{ label: "Donations" }]}
      />

      {pendingMomoCount > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Smartphone className="size-4 shrink-0 text-amber-600" />
            <span>
              <strong>{pendingMomoCount}</strong> Mobile Money transfer{pendingMomoCount > 1 ? "s" : ""} awaiting manual reconciliation.
            </span>
          </div>
          <Link
            href="/admin/donations?method=MOBILE_MONEY&status=PENDING"
            className="text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700 dark:text-amber-200"
          >
            Filter Pending MoMo →
          </Link>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-2 text-xs font-medium text-muted-foreground">Status:</span>
          {[undefined, "SUCCEEDED", "PENDING", "FAILED", "REFUNDED"].map((option) => (
            <Link
              key={option ?? "ALL"}
              href={{
                pathname: "/admin/donations",
                query: {
                  ...(option ? { status: option } : {}),
                  ...(methodParam ? { method: methodParam } : {}),
                },
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                statusParam === option
                  ? "border-brand-navy bg-brand-navy text-white dark:border-white dark:bg-white dark:text-brand-navy"
                  : "border-input bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {option ? option.charAt(0) + option.slice(1).toLowerCase() : "All"}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-2 text-xs font-medium text-muted-foreground">Method:</span>
          {[
            { label: "All", value: undefined },
            { label: "Card (Stripe)", value: "CARD" },
            { label: "Mobile Money", value: "MOBILE_MONEY" },
          ].map((m) => (
            <Link
              key={m.label}
              href={{
                pathname: "/admin/donations",
                query: {
                  ...(statusParam ? { status: statusParam } : {}),
                  ...(m.value ? { method: m.value } : {}),
                },
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                methodParam === m.value
                  ? "border-brand-navy bg-brand-navy text-white dark:border-white dark:bg-white dark:text-brand-navy"
                  : "border-input bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Cadence</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Method & Reference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id} className="hover:bg-muted/40">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      {donation.anonymous ? "Anonymous Donor" : donation.donorName}
                    </span>
                    <span className="text-xs text-muted-foreground">{donation.donorEmail}</span>
                    {donation.donorPhone && (
                      <span className="text-[11px] text-muted-foreground/80">{donation.donorPhone}</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">
                      {formatMoney(donation.amountCents, donation.currency)}
                    </span>
                    {donation.paymentMethod === "MOBILE_MONEY" && donation.amountGhsCents && (
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        GH₵ {(donation.amountGhsCents / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {donation.frequency === "MONTHLY" ? "Monthly" : "One-time"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {donation.designation.replace("_", " ")}
                    </span>
                    {donation.child && (
                      <span className="text-xs text-muted-foreground">
                        Child: <strong>{donation.child.name}</strong>
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                      {donation.paymentMethod === "MOBILE_MONEY" ? (
                        <Smartphone className="size-3.5 text-brand-accent shrink-0" />
                      ) : (
                        <CreditCard className="size-3.5 text-brand-navy shrink-0 dark:text-blue-400" />
                      )}
                      {donation.paymentMethod === "MOBILE_MONEY" ? "Mobile Money" : "Card"}
                    </span>
                    {donation.momoReference && (
                      <span className="font-mono text-xs font-semibold text-brand-accent">
                        Ref: {donation.momoReference}
                      </span>
                    )}
                    {donation.momoVerifiedBy && (
                      <span className="text-[11px] text-muted-foreground">
                        Verified by {donation.momoVerifiedBy}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge className={STATUS_VARIANT[donation.status]}>{donation.status}</Badge>
                </TableCell>

                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(donation.createdAt)}
                </TableCell>

                <TableCell className="text-right">
                  <DonationActions
                    id={donation.id}
                    status={donation.status}
                    paymentMethod={donation.paymentMethod}
                    amountFormatted={formatMoney(donation.amountCents, donation.currency)}
                  />
                </TableCell>
              </TableRow>
            ))}

            {donations.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  No donation records match the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
