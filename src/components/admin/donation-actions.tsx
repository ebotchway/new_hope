"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ConfirmMomoButton } from "@/components/admin/confirm-momo-button";
import { refundDonation } from "@/actions/admin/donations";
import type { DonationStatus, PaymentMethod } from "@/generated/prisma/enums";

interface DonationActionsProps {
  id: string;
  status: DonationStatus;
  paymentMethod: PaymentMethod;
  amountFormatted: string;
}

export function DonationActions({
  id,
  status,
  paymentMethod,
  amountFormatted,
}: DonationActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const executeRefund = () => {
    startTransition(async () => {
      const res = await refundDonation(id);
      if (res.success) {
        toast.success(`Donation refund of ${amountFormatted} processed.`);
        setConfirmOpen(false);
      } else {
        toast.error(res.error || "Refund failed");
      }
    });
  };

  if (status === "PENDING" && paymentMethod === "MOBILE_MONEY") {
    return <ConfirmMomoButton id={id} />;
  }

  if (status === "SUCCEEDED") {
    return (
      <>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          disabled={isPending}
          className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "Refunding…" : "Refund"}
        </Button>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Issue Donation Refund"
          description={`Are you sure you want to refund ${amountFormatted}? For credit/debit card transactions, an automatic refund will be issued via Stripe. For manual/ledger gifts, the transaction will be marked as refunded in the financial audit ledger.`}
          confirmText="Issue Refund"
          cancelText="Keep Donation"
          variant="destructive"
          isPending={isPending}
          onConfirm={executeRefund}
        />
      </>
    );
  }

  return null;
}
