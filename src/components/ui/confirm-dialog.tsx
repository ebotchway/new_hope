"use client";

import * as React from "react";
import { AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
  /** Optional input field for prompt replacements */
  promptInput?: boolean;
  promptValue?: string;
  onPromptChange?: (val: string) => void;
  promptPlaceholder?: string;
  promptLabel?: string;
  promptRequired?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  isPending = false,
  promptInput = false,
  promptValue = "",
  onPromptChange,
  promptPlaceholder = "Enter value…",
  promptLabel,
  promptRequired = false,
}: ConfirmDialogProps) {
  const isDestructive = variant === "destructive";
  const isWarning = variant === "warning";
  const isSuccess = variant === "success";

  const handleConfirm = async () => {
    if (promptInput && promptRequired && !promptValue.trim()) {
      return;
    }
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="pr-6">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                isDestructive && "bg-destructive/10 text-destructive dark:bg-destructive/20",
                isWarning && "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                isSuccess && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
                !isDestructive && !isWarning && !isSuccess && "bg-brand-navy/10 text-brand-navy dark:bg-blue-950/50 dark:text-blue-400"
              )}
            >
              {isDestructive ? (
                <AlertCircle className="size-5" />
              ) : isWarning ? (
                <AlertTriangle className="size-5" />
              ) : isSuccess ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Info className="size-5" />
              )}
            </div>

            <div>
              <DialogTitle className="text-lg font-bold font-heading text-foreground">
                {title}
              </DialogTitle>
              <div className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </div>
            </div>
          </div>
        </DialogHeader>

        {promptInput && (
          <div className="mt-2 space-y-1.5">
            {promptLabel && (
              <label className="text-xs font-semibold text-foreground">
                {promptLabel}
                {promptRequired && <span className="text-destructive ml-1">*</span>}
              </label>
            )}
            <Input
              value={promptValue}
              onChange={(e) => onPromptChange?.(e.target.value)}
              placeholder={promptPlaceholder}
              className="text-xs rounded-xl h-9"
              autoFocus
            />
          </div>
        )}

        <DialogFooter className="mt-4 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-xl h-9 px-4 text-xs font-medium"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            size="sm"
            onClick={handleConfirm}
            disabled={isPending || (promptInput && promptRequired && !promptValue.trim())}
            className={cn(
              "rounded-xl h-9 px-4 text-xs font-medium gap-1.5",
              !isDestructive && isSuccess && "bg-emerald-600 hover:bg-emerald-700 text-white",
              !isDestructive && !isSuccess && "bg-brand-navy hover:bg-brand-navy/90 text-white"
            )}
          >
            {isPending ? "Processing…" : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
