"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { ActionResult } from "@/actions/inquiries";
import type { HistoryEventModel as HistoryEvent } from "@/generated/prisma/models";

const initialState: ActionResult = { success: true };

export function HistoryEventForm({
  event,
  action,
}: {
  event?: HistoryEvent;
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" defaultValue={event?.year} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={event?.title} required />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bulletPoints">Bullet points (one per line)</Label>
        <Textarea
          id="bulletPoints"
          name="bulletPoints"
          rows={5}
          defaultValue={event?.bulletPoints.join("\n")}
          required
        />
      </div>

      <ImageUploadField name="image" label="Photo" existingUrl={event?.imageUrl} aspect={4 / 3} />

      <div className="grid gap-2">
        <Label htmlFor="order">Display order</Label>
        <Input id="order" name="order" type="number" defaultValue={event?.order ?? 0} className="w-32" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="published" defaultChecked={event?.published ?? true} />
        Published
      </label>

      {!state.success && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : event ? "Save changes" : "Add event"}
      </Button>
    </form>
  );
}
