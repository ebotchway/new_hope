"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { ActionResult } from "@/actions/inquiries";
import type { ChildModel as Child } from "@/generated/prisma/models";

const initialState: ActionResult = { success: true };

export function ChildForm({
  child,
  action,
}: {
  child?: Child;
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={child?.name} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            name="gender"
            defaultValue={child?.gender ?? "FEMALE"}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={child?.dateOfBirth?.toISOString().slice(0, 10)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={child?.status ?? "AVAILABLE"}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="AVAILABLE">Available</option>
            <option value="SPONSORED">Sponsored</option>
            <option value="GRADUATED">Graduated</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="school">School</Label>
          <Input id="school" name="school" defaultValue={child?.school ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={child?.location ?? ""} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={5} defaultValue={child?.bio} required />
      </div>

      <ImageUploadField name="photo" label="Photo" existingUrl={child?.photoUrl} aspect={4 / 5} />

      <div className="grid gap-2">
        <Label htmlFor="fundingGoalCents">Sponsorship goal (USD, optional)</Label>
        <Input
          id="fundingGoalCents"
          name="fundingGoalCents"
          type="number"
          min={0}
          step={1}
          defaultValue={child ? child.fundingGoalCents / 100 : ""}
          placeholder="Leave blank to hide a progress bar"
          className="w-48"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="featured" defaultChecked={child?.featured} />
        Feature this child on the homepage
      </label>

      {!state.success && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : child ? "Save changes" : "Add child"}
      </Button>
    </form>
  );
}
