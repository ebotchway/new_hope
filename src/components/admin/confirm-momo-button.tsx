"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, X, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  function handleConfirmExecute() {
    startTransition(async () => {
      const result = await markMobileMoneyDonationReceived(id);
      if (result.success) {
        toast.success("Mobile Money donation confirmed and receipt issued.");
        setConfirmOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRejectExecute() {
    startTransition(async () => {
      const result = await rejectMobileMoneyDonation(id, rejectReason || "Unmatched transfer record");
      if (result.success) {
        toast.success("Mobile money transfer marked as rejected.");
        setRejectOpen(false);
        setRejectReason("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setConfirmOpen(true)}
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
            <DropdownMenuItem onClick={() => setRejectOpen(true)} className="text-destructive focus:text-destructive">
              <X className="mr-2 size-4" />
              Reject Transfer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Confirm MoMo Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Mobile Money Transfer"
        description="Verify that this Ghanaian Mobile Money transfer has been reconciled and received into the organization's official MoMo merchant account."
        confirmText="Confirm Received"
        variant="success"
        isPending={isPending}
        onConfirm={handleConfirmExecute}
      />

      {/* Reject MoMo Dialog */}
      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject Mobile Money Transfer"
        description="Provide a brief explanation for rejecting this transfer record. The status will be updated to failed in the ledger."
        confirmText="Reject Transfer"
        variant="destructive"
        promptInput
        promptLabel="Rejection Reason"
        promptPlaceholder="e.g. Unmatched transfer, duplicate entry, incorrect amount…"
        promptValue={rejectReason}
        onPromptChange={setRejectReason}
        promptRequired
        isPending={isPending}
        onConfirm={handleRejectExecute}
      />
    </>
  );
}
