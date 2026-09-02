"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { ActionResult } from "@/actions/inquiries";
import type { TrusteeModel as Trustee } from "@/generated/prisma/models";

const initialState: ActionResult = { success: true };

export function TrusteeForm({
  trustee,
  action,
}: {
  trustee?: Trustee;
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={trustee?.name} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input id="title" name="title" defaultValue={trustee?.title ?? ""} />
      </div>
      <ImageUploadField name="photo" label="Photo" existingUrl={trustee?.photoUrl} aspect={1} round />
      <div className="grid gap-2">
        <Label htmlFor="order">Display order</Label>
        <Input id="order" name="order" type="number" defaultValue={trustee?.order ?? 0} className="w-32" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="published" defaultChecked={trustee?.published ?? true} />
        Published
      </label>

      {!state.success && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : trustee ? "Save changes" : "Add trustee"}
      </Button>
    </form>
  );
}
