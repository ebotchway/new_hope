"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  CreditCard,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Heart,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DonationActions } from "@/components/admin/donation-actions";
import { formatMoney, formatDate } from "@/lib/format";
import type { DonationStatus, PaymentMethod } from "@/generated/prisma/enums";

export interface DonationDetailData {
  id: string;
  amountCents: number;
  amountGhsCents?: number | null;
  currency: string;
  status: DonationStatus;
  paymentMethod: PaymentMethod;
  donorName: string | null;
  donorEmail: string;
  donorPhone: string | null;
  title: string | null;
  createdAt: Date | string;
  stripePaymentIntentId?: string | null;
  stripeInvoiceId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  momoReference?: string | null;
  momoVerifiedAt?: Date | string | null;
  momoVerifiedBy?: string | null;
  momoRejectionReason?: string | null;
  exchangeRate?: number | null;
  child?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export function DonationDetailDialog({ donation }: { donation: DonationDetailData }) {
  const [open, setOpen] = useState(false);

  const formattedAmount = formatMoney(donation.amountCents, donation.currency);
  const isMomo = donation.paymentMethod === "MOBILE_MONEY";
  const receiptCode = `LH-REC-${donation.id.slice(-6).toUpperCase()}`;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 gap-1.5 px-2 text-xs font-medium text-brand-navy hover:text-brand-navy dark:text-blue-400"
      >
        <Eye className="size-3.5" />
        View
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <Badge
                variant="outline"
                className={
                  donation.status === "SUCCEEDED"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : donation.status === "PENDING"
                      ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      : "border-destructive text-destructive"
                }
              >
                {donation.status}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                ID: {donation.id.slice(0, 12)}…
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold font-heading text-foreground mt-2">
              {formattedAmount}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Processed via {isMomo ? "Mobile Money" : "Card Payment"} on {formatDate(donation.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2 text-sm">
            {/* Donor Profile Section */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-brand-navy dark:text-blue-400" />
                Donor Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Full Name:</span>
                  <span className="font-semibold text-foreground">
                    {donation.title ? `${donation.title} ` : ""}
                    {donation.donorName || "Anonymous Donor"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Email Address:</span>
                  <a
                    href={`mailto:${donation.donorEmail}`}
                    className="font-medium text-brand-navy dark:text-blue-400 hover:underline"
                  >
                    {donation.donorEmail}
                  </a>
                </div>
                {donation.donorPhone && (
                  <div>
                    <span className="text-muted-foreground block text-xs">Phone:</span>
                    <span className="text-foreground">{donation.donorPhone}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground block text-xs">Receipt Tracking:</span>
                  <span className="font-mono text-foreground font-medium flex items-center gap-1">
                    <Receipt className="size-3 text-emerald-600" />
                    {receiptCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Allocation & Purpose */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Heart className="size-3.5 text-rose-500" />
                Allocation & Purpose
              </h4>
              {donation.child ? (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Direct Beneficiary:</span>
                    <span className="font-bold text-foreground">{donation.child.name}</span>
                  </div>
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs rounded-full gap-1">
                    <Link href={`/admin/children/${donation.child.id}`}>
                      Manage Child
                      <ExternalLink className="size-3" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  General Unrestricted Education & Outreach Fund.
                </p>
              )}
            </div>

            {/* Gateway & Settlement Audit Details */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Payment Gateway Audit Details
              </h4>
              <div className="space-y-2 text-xs font-mono">
                {isMomo ? (
                  <>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="font-semibold">Mobile Money</span>
                    </div>
                    {donation.amountGhsCents && (
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Local Amount:</span>
                        <span className="font-bold text-emerald-600">GH₵ {(donation.amountGhsCents / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {donation.momoReference && (
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">MoMo Reference:</span>
                        <span className="font-bold text-foreground">{donation.momoReference}</span>
                      </div>
                    )}
                    {donation.momoVerifiedBy && (
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Verified By:</span>
                        <span>{donation.momoVerifiedBy}</span>
                      </div>
                    )}
                    {donation.momoVerifiedAt && (
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Verified At:</span>
                        <span>{formatDate(donation.momoVerifiedAt)}</span>
                      </div>
                    )}
                    {donation.momoRejectionReason && (
                      <div className="flex justify-between border-b pb-1 text-destructive">
                        <span>Rejection Reason:</span>
                        <span>{donation.momoRejectionReason}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {donation.stripePaymentIntentId && (
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Stripe Intent:</span>
                        <span>{donation.stripePaymentIntentId}</span>
                      </div>
                    )}
                    {donation.stripeInvoiceId && (
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Stripe Invoice:</span>
                        <span>{donation.stripeInvoiceId}</span>
                      </div>
                    )}
                    {donation.stripeSubscriptionId && (
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Subscription ID:</span>
                        <span>{donation.stripeSubscriptionId}</span>
                      </div>
                    )}
                    {donation.stripeCustomerId && (
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Customer ID:</span>
                        <span>{donation.stripeCustomerId}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Operational Action Footer */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3.5" />
                Recorded on {formatDate(donation.createdAt)}
              </div>

              <DonationActions
                id={donation.id}
                status={donation.status}
                paymentMethod={donation.paymentMethod}
                amountFormatted={formattedAmount}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
