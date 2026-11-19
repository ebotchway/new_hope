"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/actions/inquiries";

export function DeleteButton({
  action,
  confirmMessage = "Are you sure? This cannot be undone.",
}: {
  action: () => Promise<ActionResult>;
  confirmMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action();
      if (!result.success) toast.error(result.error);
      else toast.success("Deleted successfully.");
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="size-4" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
