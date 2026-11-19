"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const handleRefund = () => {
    const confirmed = window.confirm(
      `Issue refund of ${amountFormatted} for this donation? This will trigger an automatic refund in Stripe for card payments or update the reconciliation ledger.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const res = await refundDonation(id);
      if (res.success) {
        toast.success(`Donation refund of ${amountFormatted} processed.`);
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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleRefund}
        disabled={isPending}
        className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
      >
        <RotateCcw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Refunding…" : "Refund"}
      </Button>
    );
  }

  return null;
}
