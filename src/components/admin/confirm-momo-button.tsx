"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markMobileMoneyDonationReceived,
  rejectMobileMoneyDonation,
} from "@/actions/admin/donations";

export function ConfirmMomoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!window.confirm("Confirm this Mobile Money transfer was successfully received in the LivingHope wallet?")) {
      return;
    }
    startTransition(async () => {
      const result = await markMobileMoneyDonationReceived(id);
      if (result.success) toast.success("Mobile Money donation confirmed and receipt issued.");
      else toast.error(result.error);
    });
  }

  function handleReject() {
    const reason = window.prompt("Reason for rejecting this Mobile Money record (e.g. Unmatched transfer):");
    if (reason === null) return;

    startTransition(async () => {
      const result = await rejectMobileMoneyDonation(id, reason);
      if (result.success) toast.success("Mobile money transfer marked as rejected.");
      else toast.error(result.error);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleConfirm}
        disabled={isPending}
        className="h-8 gap-1 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
      >
        <Check className="size-3.5" />
        {isPending ? "Confirming…" : "Confirm"}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" disabled={isPending}>
            <MoreHorizontal className="size-4 text-muted-foreground" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleReject} className="text-destructive focus:text-destructive">
            <X className="mr-2 size-4" />
            Reject Transfer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
