"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createChildUpdate } from "@/actions/admin/child-updates";

export function ChildUpdateForm({ childId }: { childId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createChildUpdate(childId, formData);
      if (result.success) {
        toast.success("Update posted");
        formRef.current?.reset();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6">
      <h3 className="font-semibold">Post a new update</h3>

      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="e.g. Started third grade!" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="body">Details</Label>
        <Textarea id="body" name="body" rows={4} placeholder="What's new with this child?" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="image">Photo (optional)</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="published" name="published" defaultChecked />
        <Label htmlFor="published" className="text-sm font-normal">
          Visible on the public site
        </Label>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Posting…" : "Post update"}
      </Button>
    </form>
  );
}
