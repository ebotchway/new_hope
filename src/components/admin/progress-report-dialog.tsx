"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Plus, Edit, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createChildUpdateGeneral, updateChildUpdate } from "@/actions/admin/child-updates";

interface ChildOption {
  id: string;
  name: string;
  slug: string;
}

export interface ProgressReportItem {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  published: boolean;
  childId: string;
  childName?: string;
  createdAt?: Date | string;
}

interface ProgressReportDialogProps {
  mode: "create" | "edit";
  childrenList?: ChildOption[];
  report?: ProgressReportItem;
  trigger?: React.ReactNode;
}

export function ProgressReportDialog({
  mode,
  childrenList = [],
  report,
  trigger,
}: ProgressReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedChildId, setSelectedChildId] = useState(report?.childId || (childrenList[0]?.id ?? ""));
  const [published, setPublished] = useState(report ? report.published : true);
  const formRef = useRef<HTMLFormElement>(null);

  const isEdit = mode === "edit";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("published", published ? "true" : "false");

    startTransition(async () => {
      try {
        if (isEdit && report) {
          const res = await updateChildUpdate(report.id, { success: true }, formData);
          if (res.success) {
            toast.success("Progress report updated successfully");
            setOpen(false);
          } else {
            toast.error(res.error || "Failed to update report");
          }
        } else {
          formData.set("childId", selectedChildId);
          const res = await createChildUpdateGeneral({ success: true }, formData);
          if (res.success) {
            toast.success("Progress report published successfully");
            formRef.current?.reset();
            setOpen(false);
          } else {
            toast.error(res.error || "Failed to create report");
          }
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    });
  }

  const triggerElement = trigger ? (
    <span onClick={() => setOpen(true)} className="cursor-pointer">
      {trigger}
    </span>
  ) : isEdit ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setOpen(true)}
      className="h-8 gap-1.5 px-2 text-xs"
    >
      <Edit className="size-3.5" />
      Edit
    </Button>
  ) : (
    <Button
      onClick={() => setOpen(true)}
      className="gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-medium"
    >
      <Plus className="size-4" />
      New Progress Report
    </Button>
  );

  return (
    <>
      {triggerElement}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold font-heading">
            <FileText className="size-5 text-brand-navy dark:text-blue-400" />
            {isEdit ? `Edit Report: ${report?.title}` : "New Child Progress Report"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit
              ? "Update academic progress, milestones, or termly notes for this child's public profile."
              : "Post an academic term update, medical check-up milestone, or personal achievement."}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!isEdit && (
            <div className="grid gap-1.5">
              <Label htmlFor="childId" className="text-xs font-semibold">
                Select Child <span className="text-destructive">*</span>
              </Label>
              <select
                id="childId"
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-ring"
                required
              >
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isEdit && report?.childName && (
            <div className="rounded-lg bg-muted/50 p-2.5 text-xs">
              <span className="font-semibold text-foreground">Child:</span>{" "}
              <span className="text-muted-foreground">{report.childName}</span>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Report Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={report?.title || ""}
              placeholder="e.g. Term 1 Academic Results & Health Check"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="body" className="text-xs font-semibold">
              Update Details & Observations <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="body"
              name="body"
              defaultValue={report?.body || ""}
              rows={4}
              placeholder="Share academic standing, health milestones, vocational achievements, or personal growth..."
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="image" className="text-xs font-semibold">
              Attach Report Photo (optional)
            </Label>
            {report?.imageUrl && (
              <div className="flex items-center gap-3 rounded-lg border p-2 bg-muted/20">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image src={report.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Current Photo</p>
                  <p>Upload a new file below to replace it.</p>
                </div>
              </div>
            )}
            <Input id="image" name="image" type="file" accept="image/*" />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="published-toggle"
              checked={published}
              onCheckedChange={(c) => setPublished(c === true)}
            />
            <Label htmlFor="published-toggle" className="text-xs font-medium cursor-pointer">
              Publish immediately on child&apos;s public profile
            </Label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-brand-navy hover:bg-brand-navy/90 text-white"
            >
              {isPending ? (
                "Saving..."
              ) : isEdit ? (
                "Save Changes"
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-1.5" />
                  Post Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
