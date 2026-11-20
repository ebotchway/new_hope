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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-2 pr-4">
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
              <span className="text-xs text-muted-foreground font-mono break-all">
                ID: {donation.id}
              </span>
            </div>
            <DialogTitle className="text-3xl font-bold font-heading text-foreground mt-2">
              {formattedAmount}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Processed via {isMomo ? "Ghana Mobile Money" : "Card Payment"} on {formatDate(donation.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2 text-sm">
            {/* Donor Profile Section */}
            <div className="rounded-2xl border bg-muted/30 p-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-brand-navy dark:text-blue-400" />
                Donor Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Full Name:</span>
                  <span className="font-semibold text-foreground break-words">
                    {donation.title ? `${donation.title} ` : ""}
                    {donation.donorName || "Anonymous Donor"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Email Address:</span>
                  <a
                    href={`mailto:${donation.donorEmail}`}
                    className="font-medium text-brand-navy dark:text-blue-400 hover:underline break-all block"
                  >
                    {donation.donorEmail}
                  </a>
                </div>
                {donation.donorPhone && (
                  <div>
                    <span className="text-muted-foreground block text-xs">Phone Number:</span>
                    <span className="text-foreground font-mono">{donation.donorPhone}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground block text-xs">Receipt Tracking:</span>
                  <Link
                    href={`/receipt/${donation.id}`}
                    target="_blank"
                    className="font-mono text-brand-navy hover:underline dark:text-blue-400 font-medium inline-flex items-center gap-1 mt-0.5"
                    title="Open and print official tax receipt"
                  >
                    <Receipt className="size-3.5 text-emerald-600" />
                    {receiptCode}
                    <ExternalLink className="size-3 opacity-70" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Allocation & Purpose */}
            <div className="rounded-2xl border bg-muted/30 p-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Heart className="size-3.5 text-rose-500" />
                Allocation & Purpose
              </h4>
              {donation.child ? (
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Direct Beneficiary:</span>
                    <span className="font-bold text-foreground text-sm">{donation.child.name}</span>
                  </div>
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs rounded-full gap-1">
                    <Link href={`/admin/children/${donation.child.id}`}>
                      Manage Child Profile
                      <ExternalLink className="size-3" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  General Unrestricted Education, Nutrition & Outreach Fund across Greater Accra.
                </p>
              )}
            </div>

            {/* Gateway & Settlement Audit Details */}
            <div className="rounded-2xl border bg-muted/30 p-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Payment Gateway Audit Details
              </h4>
              <div className="space-y-2.5 text-xs font-mono">
                {isMomo ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-1">
                      <span className="text-muted-foreground shrink-0">Method:</span>
                      <span className="font-semibold text-foreground">Ghanaian Mobile Money</span>
                    </div>
                    {donation.amountGhsCents && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-1">
                        <span className="text-muted-foreground shrink-0">Local Currency Settled:</span>
                        <span className="font-bold text-emerald-600">GH₵ {(donation.amountGhsCents / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {donation.momoReference && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-1">
                        <span className="text-muted-foreground shrink-0">Network MoMo Reference:</span>
                        <span className="font-bold text-foreground break-all">{donation.momoReference}</span>
                      </div>
                    )}
                    {donation.momoVerifiedBy && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-1">
                        <span className="text-muted-foreground shrink-0">Audited & Verified By:</span>
                        <span className="text-foreground break-all">{donation.momoVerifiedBy}</span>
                      </div>
                    )}
                    {donation.momoVerifiedAt && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-1">
                        <span className="text-muted-foreground shrink-0">Reconciliation Date:</span>
                        <span className="text-foreground">{formatDate(donation.momoVerifiedAt)}</span>
                      </div>
                    )}
                    {donation.momoRejectionReason && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-1 text-destructive">
                        <span className="shrink-0 font-medium">Rejection Reason:</span>
                        <span className="break-all">{donation.momoRejectionReason}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {donation.stripePaymentIntentId && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-1">
                        <span className="text-muted-foreground shrink-0">Stripe Payment Intent:</span>
                        <span className="text-foreground break-all">{donation.stripePaymentIntentId}</span>
                      </div>
                    )}
                    {donation.stripeInvoiceId && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-1">
                        <span className="text-muted-foreground shrink-0">Stripe Invoice:</span>
                        <span className="text-foreground break-all">{donation.stripeInvoiceId}</span>
                      </div>
                    )}
                    {donation.stripeSubscriptionId && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-1">
                        <span className="text-muted-foreground shrink-0">Subscription ID:</span>
                        <span className="text-foreground break-all">{donation.stripeSubscriptionId}</span>
                      </div>
                    )}
                    {donation.stripeCustomerId && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-1">
                        <span className="text-muted-foreground shrink-0">Customer ID:</span>
                        <span className="text-foreground break-all">{donation.stripeCustomerId}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Operational Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
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
