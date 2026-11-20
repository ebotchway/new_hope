"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ActionResult } from "@/actions/inquiries";

export function DeleteButton({
  action,
  title = "Delete Item",
  confirmMessage = "Are you sure? This action cannot be undone.",
}: {
  action: () => Promise<ActionResult>;
  title?: string;
  confirmMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Deleted successfully.");
        setOpen(false);
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Delete</span>
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={confirmMessage}
        confirmText="Delete Permanently"
        cancelText="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
