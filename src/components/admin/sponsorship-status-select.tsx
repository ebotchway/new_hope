"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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

  const handleChange = (newStatus: SponsorshipStatus) => {
    if (newStatus === "ENDED") {
      const confirmed = window.confirm(
        "Are you sure you want to end this sponsorship? If a Stripe recurring subscription is active, it will be cancelled."
      );
      if (!confirmed) return;
    }

    startTransition(async () => {
      const res = await updateSponsorshipStatusAction(id, newStatus);
      if (res.success) {
        setCurrent(newStatus);
        toast.success(`Sponsorship marked as ${newStatus}`);
      } else {
        toast.error(res.error || "Failed to update sponsorship status");
      }
    });
  };

  return (
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
  );
}
