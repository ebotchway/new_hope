"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateInquiryStatus } from "@/actions/admin/inquiries";
import type { InquiryStatus } from "@/generated/prisma/enums";

const STATUSES: InquiryStatus[] = ["NEW", "CONTACTED", "CLOSED"];

export function InquiryStatusSelect({ id, status }: { id: string; status: InquiryStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          const result = await updateInquiryStatus(id, e.target.value as InquiryStatus);
          if (!result.success) toast.error(result.error);
          else toast.success(`Status updated to ${e.target.value}`);
        })
      }
      className="h-8 rounded-md border border-input bg-card px-2 text-xs"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
