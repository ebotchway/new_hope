import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveDateRange } from "@/lib/reports";
import { formatMoney, formatDate } from "@/lib/format";
import type {
  DonationStatus,
  PaymentMethod,
  DonationFrequency,
  DonationDesignation,
} from "@/generated/prisma/enums";

export const metadata = {
  title: "Donation Ledger & Filterable Reports | LivingHope Admin",
};

interface DonationLedgerPageProps {
  searchParams: Promise<{
    period?: "today" | "7d" | "30d" | "this_month" | "last_month" | "this_quarter" | "this_year" | "all_time";
    status?: DonationStatus;
    method?: PaymentMethod;
    frequency?: DonationFrequency;
    designation?: DonationDesignation;
    q?: string;
    page?: string;
  }>;
}

export default async function DonationLedgerPage(props: DonationLedgerPageProps) {
  await requireStaff();
  const searchParams = await props.searchParams;

  const { from, to } = resolveDateRange({ period: searchParams.period });
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
  const pageSize = 50;

  // Build where filter
  const where: {
    createdAt?: { gte?: Date; lte?: Date };
    status?: DonationStatus;
    paymentMethod?: PaymentMethod;
    frequency?: DonationFrequency;
    designation?: DonationDesignation;
    OR?: {
      donorName?: { contains: string; mode: "insensitive" };
      donorEmail?: { contains: string; mode: "insensitive" };
      momoReference?: { contains: string; mode: "insensitive" };
      stripeInvoiceId?: { contains: string; mode: "insensitive" };
      stripePaymentIntentId?: { contains: string; mode: "insensitive" };
    }[];
  } = {};

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  if (searchParams.status && ["SUCCEEDED", "PENDING", "FAILED", "REFUNDED"].includes(searchParams.status)) {
    where.status = searchParams.status;
  }
  if (searchParams.method && ["CARD", "MOBILE_MONEY"].includes(searchParams.method)) {
    where.paymentMethod = searchParams.method;
  }
  if (searchParams.frequency && ["ONE_TIME", "MONTHLY"].includes(searchParams.frequency)) {
    where.frequency = searchParams.frequency;
  }
  if (searchParams.designation && ["GENERAL", "CHILD_SPONSORSHIP", "PARTNERSHIP"].includes(searchParams.designation)) {
    where.designation = searchParams.designation;
  }

  if (searchParams.q && searchParams.q.trim()) {
    const q = searchParams.q.trim();
    where.OR = [
      { donorName: { contains: q, mode: "insensitive" } },
      { donorEmail: { contains: q, mode: "insensitive" } },
      { momoReference: { contains: q, mode: "insensitive" } },
      { stripeInvoiceId: { contains: q, mode: "insensitive" } },
      { stripePaymentIntentId: { contains: q, mode: "insensitive" } },
    ];
  }

  const [donations, totalCount, aggregate] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: { child: { select: { name: true } }, user: { select: { email: true } } },
    }),
    prisma.donation.count({ where }),
    prisma.donation.aggregate({
      where,
      _sum: { amountCents: true, amountGhsCents: true },
      _count: true,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const totalFilteredUsdCents = aggregate._sum.amountCents ?? 0;
  const avgGiftCents = totalCount > 0 ? Math.round(totalFilteredUsdCents / totalCount) : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      <ReportHeader
        title="Donations & Financial Ledger"
        description={`Itemized transactional audit entries. ${totalCount} records matching active filters.`}
        breadcrumbs={[{ label: "Donation Ledger" }]}
        exportType="donations"
      />

      {/* Filter Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/80 bg-card p-4">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Filtered Total Volume
          </span>
          <div className="text-2xl font-bold font-heading text-foreground mt-1">
            {formatMoney(totalFilteredUsdCents)}
          </div>
          {aggregate._sum.amountGhsCents && aggregate._sum.amountGhsCents > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Includes ₵{(aggregate._sum.amountGhsCents / 100).toFixed(2)} MoMo
            </p>
          )}
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card p-4">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Matching Transactions
          </span>
          <div className="text-2xl font-bold font-heading text-foreground mt-1">
            {totalCount}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Page {currentPage} of {Math.max(1, totalPages)}
          </p>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card p-4">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Average Gift
          </span>
          <div className="text-2xl font-bold font-heading text-foreground mt-1">
            {formatMoney(avgGiftCents)}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Per matching transaction</p>
        </Card>
      </div>

      {/* Filter Controls Bar */}
      <Card className="rounded-2xl border-border/80 bg-card p-4">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={searchParams.q || ""}
              placeholder="Search donor, email, reference…"
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Status Filter */}
          <select
            name="status"
            defaultValue={searchParams.status || ""}
            className="h-9 px-3 text-xs rounded-xl bg-background border border-input text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="SUCCEEDED">Succeeded</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          {/* Payment Method */}
          <select
            name="method"
            defaultValue={searchParams.method || ""}
            className="h-9 px-3 text-xs rounded-xl bg-background border border-input text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Payment Methods</option>
            <option value="CARD">Credit / Debit Card</option>
            <option value="MOBILE_MONEY">Ghana Mobile Money</option>
          </select>

          {/* Filter Submit Button */}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" className="h-9 rounded-xl text-xs w-full bg-brand-primary hover:bg-brand-primary-hover">
              <Filter className="mr-1.5 size-3.5" />
              Apply Filter
            </Button>
            {(searchParams.status || searchParams.method || searchParams.q || searchParams.period) && (
              <Link href="/admin/reports/donations">
                <Button type="button" variant="ghost" size="sm" className="h-9 rounded-xl text-xs text-muted-foreground">
                  Reset
                </Button>
              </Link>
            )}
          </div>
        </form>
      </Card>

      {/* Detailed Ledger Table */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference / Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                    No donation records found matching these criteria.
                  </TableCell>
                </TableRow>
              ) : (
                donations.map((d) => (
                  <TableRow key={d.id} className="text-xs hover:bg-muted/40">
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(d.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{d.donorName}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                        {d.donorEmail}
                      </div>
                      {d.donorPhone && (
                        <div className="text-[10px] text-muted-foreground">{d.donorPhone}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">
                      {formatMoney(d.amountCents)}
                      {d.amountGhsCents && (
                        <div className="text-[10px] font-normal text-muted-foreground">
                          ₵{(d.amountGhsCents / 100).toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {d.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground">
                        {d.frequency === "MONTHLY" ? "Monthly Recurring" : "One-Time"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {d.child?.name ? `Child: ${d.child.name}` : d.designation}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] uppercase ${
                          d.status === "SUCCEEDED"
                            ? "bg-emerald-600 text-white"
                            : d.status === "PENDING"
                              ? "bg-amber-500 text-white"
                              : d.status === "REFUNDED"
                                ? "bg-muted text-foreground border"
                                : "bg-destructive text-white"
                        }`}
                      >
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {d.momoReference || d.stripeInvoiceId || d.stripePaymentIntentId || d.id.slice(-8)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={{
                    pathname: "/admin/reports/donations",
                    query: { ...searchParams, page: (currentPage - 1).toString() },
                  }}
                >
                  <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs">
                    Previous
                  </Button>
                </Link>
              )}
              <span className="px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={{
                    pathname: "/admin/reports/donations",
                    query: { ...searchParams, page: (currentPage + 1).toString() },
                  }}
                >
                  <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
