"use client";

import { useState, useTransition } from "react";
import { Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateCmsAppearance } from "@/actions/admin/cms";
import { AppearanceSettings } from "@/lib/cms-loader";

export function AppearanceSettingsForm({ initialConfig }: { initialConfig: AppearanceSettings }) {
  const [config, setConfig] = useState<AppearanceSettings>(initialConfig);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateCmsAppearance(formData);
      if (res.success) {
        setMessage({ type: "success", text: "Appearance and branding settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save appearance settings" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Appearance & Branding</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure design tokens, color palette swatches, fonts, and button borders.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover shadow-md font-semibold"
        >
          <Save className="mr-2 size-4" />
          <span>Save Appearance</span>
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-xs font-semibold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Brand Color Palette Swatches */}
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-lg font-bold font-heading flex items-center gap-2">
            <Palette className="size-5 text-brand-primary" />
            <span>Brand Colors & Live Palette Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Brand Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="size-10 rounded-lg border border-border cursor-pointer p-0.5"
                />
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="font-mono text-sm uppercase rounded-xl"
                />
              </div>
              <p className="text-xs text-muted-foreground">Used for main buttons, hero headers, and icons.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  className="size-10 rounded-lg border border-border cursor-pointer p-0.5"
                />
                <Input
                  id="secondaryColor"
                  name="secondaryColor"
                  value={config.secondaryColor}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  className="font-mono text-sm uppercase rounded-xl"
                />
              </div>
              <p className="text-xs text-muted-foreground">Used for badges, accents, and progress indicators.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Highlight Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  className="size-10 rounded-lg border border-border cursor-pointer p-0.5"
                />
                <Input
                  id="accentColor"
                  name="accentColor"
                  value={config.accentColor}
                  onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  className="font-mono text-sm uppercase rounded-xl"
                />
              </div>
              <p className="text-xs text-muted-foreground">Used for callout highlights and active states.</p>
            </div>
          </div>

          {/* Live Component Swatch Preview */}
          <div className="rounded-2xl border border-border/70 p-6 bg-muted/20">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
              Live Preview Swatch
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                style={{ backgroundColor: config.primaryColor }}
                className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md transition-opacity hover:opacity-90"
              >
                Primary Button
              </button>
              <button
                type="button"
                style={{ backgroundColor: config.secondaryColor }}
                className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md transition-opacity hover:opacity-90"
              >
                Secondary Button
              </button>
              <div
                style={{ backgroundColor: config.accentColor }}
                className="px-4 py-1.5 rounded-full text-slate-950 font-bold text-xs"
              >
                Active Badge
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography & Layout Tokens */}
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-lg font-bold font-heading">
            Typography, Corners & Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fontHeading">Heading Font Style</Label>
              <select
                id="fontHeading"
                name="fontHeading"
                value={config.fontHeading}
                onChange={(e) => setConfig({ ...config, fontHeading: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="font-heading">Fraunces (Warm Editorial Serif)</option>
                <option value="font-sans">Geist (Clean Modern Sans)</option>
                <option value="font-serif">Georgia / Traditional Serif</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonRadius">Button & Card Corner Radius</Label>
              <select
                id="buttonRadius"
                name="buttonRadius"
                value={config.buttonRadius}
                onChange={(e) => setConfig({ ...config, buttonRadius: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="rounded-xl">Soft Curves (rounded-xl)</option>
                <option value="rounded-md">Subtle (rounded-md)</option>
                <option value="rounded-full">Pill (rounded-full)</option>
                <option value="rounded-none">Sharp (rounded-none)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="containerWidth">Maximum Content Container</Label>
              <select
                id="containerWidth"
                name="containerWidth"
                value={config.containerWidth}
                onChange={(e) => setConfig({ ...config, containerWidth: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="max-w-7xl">Standard Wide (1280px / max-w-7xl)</option>
                <option value="max-w-6xl">Compact (1152px / max-w-6xl)</option>
                <option value="max-w-screen-2xl">Ultra Wide (1536px / max-w-screen-2xl)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerTheme">Footer Background Theme</Label>
              <select
                id="footerTheme"
                name="footerTheme"
                value={config.footerTheme}
                onChange={(e) => setConfig({ ...config, footerTheme: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="dark">Dark Slate (High Contrast)</option>
                <option value="brand">Deep Brand Forest</option>
                <option value="light">Light Warm Background</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-border/50">
            <div>
              <Label className="font-semibold text-base">Sticky Header Navigation</Label>
              <p className="text-xs text-muted-foreground">Keep the main header pinned while users scroll down pages.</p>
            </div>
            <input type="hidden" name="headerSticky" value={config.headerSticky ? "true" : "false"} />
            <Switch
              checked={config.headerSticky}
              onCheckedChange={(checked) => setConfig({ ...config, headerSticky: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
