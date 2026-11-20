"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { updateSponsorshipStatusAction } from "@/actions/admin/sponsorships";
import type { SponsorshipStatus } from "@/generated/prisma/enums";

const STATUSES: { value: SponsorshipStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "ENDED", label: "Ended" },
];

export function SponsorshipStatusSelect({
  id,
  status,
}: {
  id: string;
  status: SponsorshipStatus;
}) {
  const [current, setCurrent] = useState<SponsorshipStatus>(status);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<SponsorshipStatus | null>(null);

  const applyStatusChange = (newStatus: SponsorshipStatus) => {
    startTransition(async () => {
      const res = await updateSponsorshipStatusAction(id, newStatus);
      if (res.success) {
        setCurrent(newStatus);
        toast.success(`Sponsorship marked as ${newStatus}`);
        setConfirmOpen(false);
        setPendingStatus(null);
      } else {
        toast.error(res.error || "Failed to update sponsorship status");
      }
    });
  };

  const handleChange = (newStatus: SponsorshipStatus) => {
    if (newStatus === "ENDED") {
      setPendingStatus(newStatus);
      setConfirmOpen(true);
      return;
    }
    applyStatusChange(newStatus);
  };

  return (
    <>
      <select
        value={current}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as SponsorshipStatus)}
        className="h-7 rounded-md border border-input bg-card px-2 text-[11px] font-semibold text-foreground"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="End Child Sponsorship"
        description="Are you sure you want to end this sponsorship commitment? If an automated Stripe recurring card subscription is active for this sponsorship, it will be cancelled."
        confirmText="End Sponsorship"
        cancelText="Keep Active"
        variant="destructive"
        isPending={isPending}
        onConfirm={() => {
          if (pendingStatus) {
            applyStatusChange(pendingStatus);
          }
        }}
      />
    </>
  );
}
