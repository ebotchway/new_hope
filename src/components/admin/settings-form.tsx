"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteSettings } from "@/actions/admin/settings";
import type { ActionResult } from "@/actions/inquiries";
import type { SiteSettingsModel as SiteSettings } from "@/generated/prisma/models";

const initialState: ActionResult = { success: true };

export function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState(
    async (prev: ActionResult, formData: FormData) => {
      const res = await updateSiteSettings(prev, formData);
      if (res.success) {
        toast.success("Settings updated successfully.");
      } else {
        toast.error(res.error);
      }
      return res;
    },
    initialState
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b pb-2">Homepage Hero</h2>
        <div className="grid gap-2">
          <Label htmlFor="heroHeadline">Headline</Label>
          <Input id="heroHeadline" name="heroHeadline" defaultValue={settings?.heroHeadline} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="heroSubheadline">Subheadline</Label>
          <Input id="heroSubheadline" name="heroSubheadline" defaultValue={settings?.heroSubheadline} required />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b pb-2">Guiding Mission</h2>
        <div className="grid gap-2">
          <Label htmlFor="missionTitle">Title</Label>
          <Input id="missionTitle" name="missionTitle" defaultValue={settings?.missionTitle} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="missionBody">Body Text</Label>
          <Textarea id="missionBody" name="missionBody" rows={4} defaultValue={settings?.missionBody} required />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b pb-2">Social &amp; Contact Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="contactEmail">Public Contact Email</Label>
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings?.contactEmail ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input id="contactPhone" name="contactPhone" defaultValue={settings?.contactPhone ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="facebookUrl">Facebook Page URL</Label>
            <Input id="facebookUrl" name="facebookUrl" type="url" placeholder="https://facebook.com/..." defaultValue={settings?.facebookUrl ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="twitterUrl">Twitter / X URL</Label>
            <Input id="twitterUrl" name="twitterUrl" type="url" placeholder="https://x.com/..." defaultValue={settings?.twitterUrl ?? ""} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="youtubeUrl">YouTube Channel URL</Label>
            <Input id="youtubeUrl" name="youtubeUrl" type="url" placeholder="https://youtube.com/..." defaultValue={settings?.youtubeUrl ?? ""} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b pb-2">Ghana Mobile Money Configuration</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Configure local Mobile Money merchant payment instructions shown to donors.
          Provide the registered account name and phone number.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="momoProvider">Provider</Label>
            <Input id="momoProvider" name="momoProvider" placeholder="MTN Mobile Money" defaultValue={settings?.momoProvider ?? "MTN Mobile Money"} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="momoNumber">Merchant / Receiving Number</Label>
            <Input id="momoNumber" name="momoNumber" placeholder="024 XXX XXXX" defaultValue={settings?.momoNumber ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="momoName">Registered Account Name</Label>
            <Input id="momoName" name="momoName" placeholder="LivingHope NGO" defaultValue={settings?.momoName ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="momoRateUsdToGhs">Exchange Rate (USD to GHS)</Label>
            <Input
              id="momoRateUsdToGhs"
              name="momoRateUsdToGhs"
              type="number"
              step="0.01"
              min="1"
              defaultValue={settings?.momoRateUsdToGhs ?? 15.5}
            />
            <p className="text-[11px] text-muted-foreground">Used to compute accurate Cedi amounts for donors.</p>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="momoInstructions">Custom Transfer Instructions</Label>
            <Textarea
              id="momoInstructions"
              name="momoInstructions"
              rows={3}
              placeholder="e.g., Dial *170#, select Transfer Money > MoMo User..."
              defaultValue={settings?.momoInstructions ?? ""}
            />
          </div>
        </div>
      </section>

      {!state.success && <p className="text-sm font-medium text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="px-6">
        {isPending ? "Saving…" : "Save all settings"}
      </Button>
    </form>
  );
}
