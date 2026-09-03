"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteSettings } from "@/actions/admin/settings";
import type { ActionResult } from "@/actions/inquiries";
import type { SiteSettingsModel as SiteSettings } from "@/generated/prisma/models";

const initialState: ActionResult = { success: true };

export function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState(updateSiteSettings, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="font-semibold text-foreground">Homepage Hero</h2>
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
        <h2 className="font-semibold text-foreground">Guiding Mission</h2>
        <div className="grid gap-2">
          <Label htmlFor="missionTitle">Title</Label>
          <Input id="missionTitle" name="missionTitle" defaultValue={settings?.missionTitle} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="missionBody">Body</Label>
          <Textarea id="missionBody" name="missionBody" rows={4} defaultValue={settings?.missionBody} required />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-foreground">Social &amp; Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="facebookUrl">Facebook URL</Label>
            <Input id="facebookUrl" name="facebookUrl" defaultValue={settings?.facebookUrl ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="twitterUrl">Twitter / X URL</Label>
            <Input id="twitterUrl" name="twitterUrl" defaultValue={settings?.twitterUrl ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input id="youtubeUrl" name="youtubeUrl" defaultValue={settings?.youtubeUrl ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings?.contactEmail ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input id="contactPhone" name="contactPhone" defaultValue={settings?.contactPhone ?? ""} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-foreground">Mobile Money</h2>
        <p className="text-xs text-muted-foreground">
          Set a merchant number to offer Mobile Money as a payment option on the donation page.
          Leave blank to hide it.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="momoProvider">Provider</Label>
            <Input id="momoProvider" name="momoProvider" placeholder="MTN Mobile Money" defaultValue={settings?.momoProvider ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="momoNumber">Merchant Number</Label>
            <Input id="momoNumber" name="momoNumber" placeholder="024 XXX XXXX" defaultValue={settings?.momoNumber ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="momoName">Registered Name</Label>
            <Input id="momoName" name="momoName" placeholder="LivingHope Ghana" defaultValue={settings?.momoName ?? ""} />
          </div>
        </div>
      </section>

      {!state.success && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save settings"}
      </Button>
      <p className="text-xs text-muted-foreground">Changes apply across the site immediately after saving.</p>
    </form>
  );
}
