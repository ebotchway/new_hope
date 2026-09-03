"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markMobileMoneyDonationReceived } from "@/actions/admin/donations";

export function ConfirmMomoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Confirm this Mobile Money transfer was received?")) return;
    startTransition(async () => {
      const result = await markMobileMoneyDonationReceived(id);
      if (result.success) toast.success("Donation confirmed");
      else toast.error(result.error);
    });
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? "Confirming…" : "Confirm received"}
    </Button>
  );
}
