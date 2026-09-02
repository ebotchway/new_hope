"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { ActionResult } from "@/actions/inquiries";
import type { StoryModel as Story } from "@/generated/prisma/models";

const initialState: ActionResult = { success: true };

export function StoryForm({
  story,
  action,
}: {
  story?: Story;
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={story?.name} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="age">Age</Label>
          <Input id="age" name="age" type="number" defaultValue={story?.age ?? undefined} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="quote">Quote</Label>
        <Textarea id="quote" name="quote" rows={4} defaultValue={story?.quote} required />
      </div>

      <ImageUploadField name="image" label="Photo" existingUrl={story?.imageUrl} aspect={1} round />

      <div className="grid gap-2">
        <Label htmlFor="order">Display order</Label>
        <Input id="order" name="order" type="number" defaultValue={story?.order ?? 0} className="w-32" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="published" defaultChecked={story?.published ?? true} />
        Published
      </label>

      {!state.success && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : story ? "Save changes" : "Add story"}
      </Button>
    </form>
  );
}
