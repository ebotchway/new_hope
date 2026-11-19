"use client";

import { useState, useActionState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CreditCard,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Smartphone,
  Globe,
  Archive,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { updateSiteSettings, testStripeCredentialsAction } from "@/actions/admin/settings";
import type { ActionResult } from "@/actions/inquiries";
import type { SiteSettingsModel as SiteSettings } from "@/generated/prisma/models";

const initialState: ActionResult = { success: true };

interface SettingsFormProps {
  settings: SiteSettings | null;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [secretKeyInput, setSecretKeyInput] = useState(settings?.stripeSecretKey ?? "");
  const [stripeMode, setStripeMode] = useState<"test" | "live">(
    settings?.stripeMode === "live" ? "live" : "test"
  );
  const [clearCredentials, setClearCredentials] = useState(false);

  // Live Stripe connection test state
  const [isTestingStripe, startStripeTest] = useTransition();
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    mode?: "test" | "live";
    currencies?: string[];
    error?: string;
  } | null>(null);

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

  const handleTestConnection = () => {
    startStripeTest(async () => {
      setTestResult(null);
      const res = await testStripeCredentialsAction(secretKeyInput || undefined);
      setTestResult({
        tested: true,
        success: res.success,
        mode: res.mode,
        currencies: res.currencies,
        error: res.error,
      });

      if (res.success) {
        toast.success(`Stripe connection verified (${res.mode?.toUpperCase()} mode)`);
      } else {
        toast.error(res.error || "Stripe connection test failed");
      }
    });
  };

  const copyWebhookUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com";
    const url = `${origin}/api/webhooks/stripe`;
    navigator.clipboard.writeText(url);
    toast.success("Webhook URL copied to clipboard");
  };

  const hasDbStripe = Boolean(settings?.stripeSecretKey);

  return (
    <form action={formAction} className="space-y-10">
      {/* Quick Navigation Jump Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-4">
        <a
          href="#stripe-gateway"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <CreditCard className="h-3.5 w-3.5" />
          Stripe Payment Gateway
        </a>
        <a
          href="#momo-gateway"
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Smartphone className="h-3.5 w-3.5" />
          Mobile Money (Ghana)
        </a>
        <a
          href="#content-settings"
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Globe className="h-3.5 w-3.5" />
          Content &amp; Social
        </a>
        <Link
          href="/admin/settings/backups"
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted ml-auto"
        >
          <Archive className="h-3.5 w-3.5" />
          Backups &amp; Restore
        </Link>
      </div>

      {/* ============================================================== */}
      {/* 1. STRIPE PAYMENT GATEWAY CONFIGURATION                        */}
      {/* ============================================================== */}
      <section id="stripe-gateway" className="scroll-mt-6 rounded-2xl border bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-foreground">Stripe Payment Gateway</h2>
              {hasDbStripe ? (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Database Configured
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Environment Fallback
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Configure your Stripe API credentials to securely accept online credit/debit card donations and automated monthly recurring child sponsorships.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTestingStripe}
            className="shrink-0 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTestingStripe ? "animate-spin" : ""}`} />
            Test Stripe Connection
          </Button>
        </div>

        {/* Live Test Results Alert */}
        {testResult?.tested && (
          <div
            className={`rounded-xl border p-4 text-xs ${
              testResult.success
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                : "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-300"
            }`}
          >
            <div className="flex items-start gap-3">
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold text-sm">
                  {testResult.success
                    ? `Stripe Gateway Verified (${testResult.mode?.toUpperCase()} Mode)`
                    : "Stripe Connection Failed"}
                </p>
                <p className="leading-relaxed">
                  {testResult.success
                    ? `Successfully communicated with Stripe API. Supported currencies: ${testResult.currencies?.join(", ") || "USD"}.`
                    : testResult.error}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* Mode Selector */}
          <div className="grid gap-2">
            <Label className="text-xs font-semibold">Gateway Operating Mode</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="stripeMode"
                  value="test"
                  checked={stripeMode === "test"}
                  onChange={() => setStripeMode("test")}
                  className="text-primary focus:ring-primary"
                />
                <span className="font-medium">Test Mode (Sandbox / pk_test_..., sk_test_...)</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="stripeMode"
                  value="live"
                  checked={stripeMode === "live"}
                  onChange={() => setStripeMode("live")}
                  className="text-primary focus:ring-primary"
                />
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Live Production Mode (Real Cards)
                </span>
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Publishable Key */}
            <div className="grid gap-2">
              <Label htmlFor="stripePublishableKey" className="text-xs font-semibold flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                Stripe Publishable Key
              </Label>
              <Input
                id="stripePublishableKey"
                name="stripePublishableKey"
                placeholder={stripeMode === "live" ? "pk_live_..." : "pk_test_..."}
                defaultValue={settings?.stripePublishableKey ?? ""}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">Public key used on donor checkout pages.</p>
            </div>

            {/* Secret Key with eye toggle */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="stripeSecretKey" className="text-xs font-semibold flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                  Stripe Secret Key
                </Label>
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1"
                >
                  {showSecretKey ? (
                    <>
                      <EyeOff className="h-3 w-3" /> Hide Key
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" /> Reveal Key
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="stripeSecretKey"
                  name="stripeSecretKey"
                  type={showSecretKey ? "text" : "password"}
                  placeholder={stripeMode === "live" ? "sk_live_..." : "sk_test_..."}
                  value={secretKeyInput}
                  onChange={(e) => setSecretKeyInput(e.target.value)}
                  className="font-mono text-xs pr-10"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {hasDbStripe
                  ? "A secret key is already saved in the database. Leave as-is to preserve or input a new key to update."
                  : "Private API key used for payment intent execution and recurring subscriptions."}
              </p>
            </div>
          </div>

          {/* Webhook Secret */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="stripeWebhookSecret" className="text-xs font-semibold flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                  Webhook Signing Secret
                </Label>
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1"
                >
                  {showWebhookSecret ? (
                    <>
                      <EyeOff className="h-3 w-3" /> Hide Secret
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" /> Reveal Secret
                    </>
                  )}
                </button>
              </div>
              <Input
                id="stripeWebhookSecret"
                name="stripeWebhookSecret"
                type={showWebhookSecret ? "text" : "password"}
                placeholder="whsec_..."
                defaultValue={settings?.stripeWebhookSecret ?? ""}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Signing secret generated when configuring your Stripe Webhook endpoint.
              </p>
            </div>

            {/* Clear Credentials Toggle */}
            {hasDbStripe && (
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="clearStripeCredentials"
                  name="clearStripeCredentials"
                  value="true"
                  checked={clearCredentials}
                  onChange={(e) => setClearCredentials(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-destructive focus:ring-destructive"
                />
                <Label htmlFor="clearStripeCredentials" className="text-xs text-muted-foreground cursor-pointer">
                  Remove database credentials on save (reverts to .env)
                </Label>
              </div>
            )}
          </div>

          {/* Webhook Endpoint Guide Box */}
          <div className="rounded-xl border border-muted bg-muted/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Stripe Webhook Registration Guide</span>
              </div>
              <a
                href="https://dashboard.stripe.com/webhooks"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                Open Stripe Webhooks Dashboard <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <p className="text-xs text-muted-foreground">
              To receive automated subscription renewals, payment confirmations, and refunds, register this endpoint URL in your Stripe Dashboard:
            </p>

            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border bg-background px-3 py-1.5 font-mono text-xs text-foreground select-all break-all">
                {typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com"}/api/webhooks/stripe
              </code>
              <Button type="button" variant="outline" size="sm" onClick={copyWebhookUrl} className="shrink-0 gap-1">
                <Copy className="h-3.5 w-3.5" />
                Copy URL
              </Button>
            </div>

            <div className="text-[11px] text-muted-foreground space-y-1">
              <span className="font-semibold text-foreground">Required Webhook Events:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["checkout.session.completed", "invoice.paid", "invoice.payment_failed", "charge.refunded"].map((ev) => (
                  <Badge key={ev} variant="outline" className="font-mono text-[10px] bg-background">
                    {ev}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. GHANA MOBILE MONEY CONFIGURATION                            */}
      {/* ============================================================== */}
      <section id="momo-gateway" className="scroll-mt-6 rounded-2xl border bg-card p-6 shadow-xs space-y-4">
        <div className="border-b pb-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" />
            Ghana Mobile Money Configuration
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            Configure local Mobile Money merchant payment instructions shown to donors choosing MTN MoMo, Telecel, or AirtelTigo.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="momoProvider" className="text-xs font-semibold">Provider / Network</Label>
            <Input id="momoProvider" name="momoProvider" placeholder="MTN Mobile Money" defaultValue={settings?.momoProvider ?? "MTN Mobile Money"} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="momoNumber" className="text-xs font-semibold">Merchant / Receiving Number</Label>
            <Input id="momoNumber" name="momoNumber" placeholder="024 XXX XXXX" defaultValue={settings?.momoNumber ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="momoName" className="text-xs font-semibold">Registered Account Name</Label>
            <Input id="momoName" name="momoName" placeholder="LivingHope NGO" defaultValue={settings?.momoName ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="momoRateUsdToGhs" className="text-xs font-semibold">Exchange Rate (USD to GHS)</Label>
            <Input
              id="momoRateUsdToGhs"
              name="momoRateUsdToGhs"
              type="number"
              step="0.01"
              min="1"
              defaultValue={settings?.momoRateUsdToGhs ?? 15.5}
            />
            <p className="text-[11px] text-muted-foreground">Used to convert USD donation amounts into Ghana Cedis.</p>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="momoInstructions" className="text-xs font-semibold">Custom Transfer Instructions</Label>
            <Textarea
              id="momoInstructions"
              name="momoInstructions"
              rows={3}
              placeholder="e.g., Dial *170#, select Transfer Money > MoMo User, enter number..."
              defaultValue={settings?.momoInstructions ?? ""}
            />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. CONTENT, HERO & CONTACT DETAILS                             */}
      {/* ============================================================== */}
      <section id="content-settings" className="scroll-mt-6 rounded-2xl border bg-card p-6 shadow-xs space-y-6">
        <div className="border-b pb-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Public Content &amp; Contact Details
          </h2>
          <p className="text-xs text-muted-foreground">Manage organization contact channels and homepage defaults.</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Homepage Hero</h3>
          <div className="grid gap-2">
            <Label htmlFor="heroHeadline" className="text-xs">Headline</Label>
            <Input id="heroHeadline" name="heroHeadline" defaultValue={settings?.heroHeadline} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="heroSubheadline" className="text-xs">Subheadline</Label>
            <Input id="heroSubheadline" name="heroSubheadline" defaultValue={settings?.heroSubheadline} required />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Guiding Mission</h3>
          <div className="grid gap-2">
            <Label htmlFor="missionTitle" className="text-xs">Title</Label>
            <Input id="missionTitle" name="missionTitle" defaultValue={settings?.missionTitle} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="missionBody" className="text-xs">Body Text</Label>
            <Textarea id="missionBody" name="missionBody" rows={4} defaultValue={settings?.missionBody} required />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Contact &amp; Social Channels</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contactEmail" className="text-xs">Public Contact Email</Label>
              <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings?.contactEmail ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPhone" className="text-xs">Contact Phone</Label>
              <Input id="contactPhone" name="contactPhone" defaultValue={settings?.contactPhone ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="facebookUrl" className="text-xs">Facebook Page URL</Label>
              <Input id="facebookUrl" name="facebookUrl" type="url" placeholder="https://facebook.com/..." defaultValue={settings?.facebookUrl ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="twitterUrl" className="text-xs">Twitter / X URL</Label>
              <Input id="twitterUrl" name="twitterUrl" type="url" placeholder="https://x.com/..." defaultValue={settings?.twitterUrl ?? ""} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="youtubeUrl" className="text-xs">YouTube Channel URL</Label>
              <Input id="youtubeUrl" name="youtubeUrl" type="url" placeholder="https://youtube.com/..." defaultValue={settings?.youtubeUrl ?? ""} />
            </div>
          </div>
        </div>
      </section>

      {/* Error Output */}
      {!state.success && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive">
          {state.error}
        </div>
      )}

      {/* Save Button */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur">
        <p className="text-xs text-muted-foreground">
          Modifications take effect immediately across public checkout, webhooks, and pages.
        </p>
        <Button type="submit" disabled={isPending} className="px-6 font-semibold">
          {isPending ? "Saving Changes…" : "Save All Settings"}
        </Button>
      </div>
    </form>
  );
}
