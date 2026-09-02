"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { ActionResult } from "@/actions/inquiries";
import type { ImpactStatModel as ImpactStat } from "@/generated/prisma/models";

const initialState: ActionResult = { success: true };

export function ImpactStatForm({
  stat,
  action,
}: {
  stat?: ImpactStat;
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="value">Value</Label>
        <Input id="value" name="value" placeholder="20+" defaultValue={stat?.value} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          name="label"
          placeholder="Street children provided with education / vocational training"
          defaultValue={stat?.label}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="order">Display order</Label>
        <Input id="order" name="order" type="number" defaultValue={stat?.order ?? 0} className="w-32" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="published" defaultChecked={stat?.published ?? true} />
        Published
      </label>

      {!state.success && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : stat ? "Save changes" : "Add stat"}
      </Button>
    </form>
  );
}
