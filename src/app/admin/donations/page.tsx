import Link from "next/link";
import { Smartphone, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmMomoButton } from "@/components/admin/confirm-momo-button";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/format";
import type { DonationStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Donations" };

const STATUS_VARIANT: Record<DonationStatus, string> = {
  SUCCEEDED: "bg-emerald-600 text-white",
  PENDING: "bg-amber-500 text-white",
  FAILED: "bg-destructive text-white",
  REFUNDED: "bg-muted text-foreground",
};

export default async function AdminDonationsPage(props: PageProps<"/admin/donations">) {
  const searchParams = await props.searchParams;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;

  const donations = await prisma.donation.findMany({
    where: status ? { status: status as DonationStatus } : undefined,
    include: { child: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const total = await prisma.donation.aggregate({
    where: { status: "SUCCEEDED" },
    _sum: { amountCents: true },
  });

  return (
    <>
      <AdminPageHeader
        title="Donations"
        description={`Total raised: ${formatMoney(total._sum.amountCents ?? 0)}`}
        breadcrumbs={[{ label: "Donations" }]}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {[undefined, "SUCCEEDED", "PENDING", "FAILED", "REFUNDED"].map((option) => (
          <Link
            key={option ?? "ALL"}
            href={option ? `/admin/donations?status=${option}` : "/admin/donations"}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              status === option
                ? "border-brand-navy bg-brand-navy text-white"
                : "border-input bg-card text-muted-foreground hover:bg-secondary"
            )}
          >
            {option ?? "All"}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-36" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell>
                  <p className="font-medium">{donation.anonymous ? "Anonymous" : donation.donorName}</p>
                  <p className="text-xs text-muted-foreground">{donation.donorEmail}</p>
                </TableCell>
                <TableCell className="font-semibold">{formatMoney(donation.amountCents, donation.currency)}</TableCell>
                <TableCell>{donation.frequency === "MONTHLY" ? "Monthly" : "One-time"}</TableCell>
                <TableCell>
                  {donation.designation.replace("_", " ")}
                  {donation.child && <span className="text-muted-foreground"> · {donation.child.name}</span>}
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    {donation.paymentMethod === "MOBILE_MONEY" ? (
                      <Smartphone className="size-3.5" />
                    ) : (
                      <CreditCard className="size-3.5" />
                    )}
                    {donation.paymentMethod === "MOBILE_MONEY" ? "Mobile Money" : "Card"}
                  </span>
                  {donation.momoReference && (
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{donation.momoReference}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_VARIANT[donation.status]}>{donation.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(donation.createdAt)}</TableCell>
                <TableCell>
                  {donation.status === "PENDING" && donation.paymentMethod === "MOBILE_MONEY" && (
                    <ConfirmMomoButton id={donation.id} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {donations.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No donations yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
