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
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={child?.name} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            name="gender"
            defaultValue={child?.gender ?? "FEMALE"}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
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
            defaultValue={child?.dateOfBirth ? new Date(child.dateOfBirth).toISOString().slice(0, 10) : ""}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Sponsorship Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={child?.status ?? "AVAILABLE"}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
          >
            <option value="AVAILABLE">Available for Sponsorship</option>
            <option value="SPONSORED">Fully Sponsored</option>
            <option value="GRADUATED">Graduated from Program</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="school">School / Vocational Center</Label>
          <Input id="school" name="school" placeholder="e.g. Accra Community School" defaultValue={child?.school ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">City / Community Location</Label>
          <Input id="location" name="location" placeholder="e.g. Accra, Ghana" defaultValue={child?.location ?? ""} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Biography & Background Story</Label>
        <Textarea id="bio" name="bio" rows={5} defaultValue={child?.bio} required />
      </div>

      <ImageUploadField name="photo" label="Child Portrait Photo" existingUrl={child?.photoUrl} aspect={4 / 5} />

      <div className="grid gap-2">
        <Label htmlFor="fundingGoalCents">Monthly or Program Funding Goal (USD, optional)</Label>
        <Input
          id="fundingGoalCents"
          name="fundingGoalCents"
          type="number"
          min={0}
          step={1}
          defaultValue={child && child.fundingGoalCents ? child.fundingGoalCents / 100 : ""}
          placeholder="e.g. 150"
          className="w-48"
        />
        <p className="text-[11px] text-muted-foreground">Leave 0 to hide funding progress bar on profile.</p>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <Checkbox name="featured" defaultChecked={child?.featured} />
          Feature this child on the homepage showcase
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <Checkbox name="archived" defaultChecked={child?.archived} />
          Archive child (hides from public directory while preserving sponsorship history)
        </label>
      </div>

      {!state.success && <p className="text-sm font-medium text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="px-6">
        {isPending ? "Saving…" : child ? "Save changes" : "Add child"}
      </Button>
    </form>
  );
}
