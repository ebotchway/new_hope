"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock, Smartphone, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { donationSchema } from "@/lib/validations";
import { createDonationCheckout } from "@/actions/donations";
import type { z } from "zod";

type FormValues = z.infer<typeof donationSchema>;

const AMOUNT_PRESETS = [2500, 5000, 10000, 25000];

export function DonationForm({
  childId,
  childName,
  designation,
  defaultFrequency,
  prefillName,
  prefillEmail,
  momoEnabled = false,
  momoProviderName,
  momoRate = 15.5,
}: {
  childId?: string;
  childName?: string;
  designation: FormValues["designation"];
  defaultFrequency: FormValues["frequency"];
  prefillName?: string;
  prefillEmail?: string;
  momoEnabled?: boolean;
  momoProviderName?: string;
  momoRate?: number;
}) {
  const [customAmount, setCustomAmount] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      title: "",
      donorName: prefillName ?? "",
      donorEmail: prefillEmail ?? "",
      donorPhone: "",
      anonymous: false,
      amountCents: AMOUNT_PRESETS[1],
      frequency: defaultFrequency,
      designation,
      paymentMethod: "CARD",
      childId,
      emailUpdates: true,
      smsUpdates: false,
      whatsappUpdates: false,
      companyHoneypot: "",
    },
  });

  const amountCents = watch("amountCents");
  const frequency = watch("frequency");
  const paymentMethod = watch("paymentMethod");
  const anonymous = watch("anonymous");
  const emailUpdates = watch("emailUpdates");

  async function onSubmit(values: FormValues) {
    try {
      const result = await createDonationCheckout(values);
      if (result.success) {
        window.location.href = result.url;
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Couldn't start checkout — check your connection and try again.");
    }
  }

  const estimatedGhs = ((amountCents / 100) * (momoRate || 15.5)).toFixed(2);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Invisible anti-spam honeypot */}
      <input
        type="text"
        {...register("companyHoneypot")}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />

      {childName && (
        <div className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-sm text-foreground">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-white/10 dark:text-white shrink-0">
            <HeartHandshake className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Sponsorship for {childName}</p>
            <p className="text-xs text-muted-foreground">Your contribution funds schooling, meals, and care.</p>
          </div>
        </div>
      )}

      <div>
        <Label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Contribution Cadence
        </Label>
        <div className="grid grid-cols-2 gap-2.5">
          {(["ONE_TIME", "MONTHLY"] as const).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setValue("frequency", freq)}
              className={cn(
                "rounded-xl border py-3 text-sm font-semibold transition-all shadow-xs",
                frequency === freq
                  ? "border-brand-navy bg-brand-navy text-white shadow-brand-navy/20 dark:border-white dark:bg-white dark:text-brand-navy"
                  : "border-input bg-card text-foreground hover:bg-secondary"
              )}
            >
              {freq === "ONE_TIME" ? "One-time Gift" : "Monthly Recurring"}
            </button>
          ))}
        </div>
      </div>

      {momoEnabled && (
        <div>
          <Label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Payment Method
          </Label>
          <div className="grid grid-cols-2 gap-2.5">
            {(["CARD", "MOBILE_MONEY"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setValue("paymentMethod", method)}
                className={cn(
                  "rounded-xl border py-3 text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2",
                  paymentMethod === method
                    ? "border-brand-navy bg-brand-navy text-white shadow-brand-navy/20 dark:border-white dark:bg-white dark:text-brand-navy"
                    : "border-input bg-card text-foreground hover:bg-secondary"
                )}
              >
                {method === "CARD" ? (
                  <>
                    <Lock className="size-4" /> Credit / Debit Card
                  </>
                ) : (
                  <>
                    <Smartphone className="size-4" /> {momoProviderName || "Mobile Money"}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Amount
          </Label>
          {paymentMethod === "MOBILE_MONEY" && (
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              ≈ GH₵ {estimatedGhs}
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setValue("amountCents", preset);
                setCustomAmount("");
              }}
              className={cn(
                "rounded-xl border py-3 text-sm font-semibold transition-all shadow-xs",
                amountCents === preset && !customAmount
                  ? "border-brand-navy bg-brand-navy text-white shadow-brand-navy/20 dark:border-white dark:bg-white dark:text-brand-navy"
                  : "border-input bg-card text-foreground hover:bg-secondary"
              )}
            >
              {formatMoney(preset)}
            </button>
          ))}
        </div>
        <div className="mt-2.5">
          <Input
            type="number"
            min={5}
            placeholder="Custom amount in USD (min $5)"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              const dollars = Number(e.target.value);
              if (dollars > 0) setValue("amountCents", Math.round(dollars * 100));
            }}
            className="rounded-xl h-11"
          />
        </div>
        {errors.amountCents && <p className="mt-1 text-xs text-destructive">{errors.amountCents.message}</p>}
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
        <h3 className="font-semibold text-foreground text-base border-b pb-3">Donor Information</h3>

        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Select onValueChange={(v: string | null) => setValue("title", v ?? "")}>
            <SelectTrigger id="title" className="rounded-xl">
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent>
              {["Mr", "Mrs", "Ms", "Dr", "Rev", "Prof"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="donorName">Full Name</Label>
          <Input id="donorName" placeholder="e.g. Kwame Mensah" className="rounded-xl" {...register("donorName")} />
          {errors.donorName && <p className="text-xs text-destructive">{errors.donorName.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="donorEmail">Email Address (for receipt)</Label>
          <Input id="donorEmail" type="email" placeholder="kwame@example.com" className="rounded-xl" {...register("donorEmail")} />
          {errors.donorEmail && <p className="text-xs text-destructive">{errors.donorEmail.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="donorPhone">Phone Number (optional)</Label>
          <Input id="donorPhone" placeholder="+233 24 000 0000" className="rounded-xl" {...register("donorPhone")} />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id="anonymous"
            checked={anonymous}
            onCheckedChange={(checked) => setValue("anonymous", checked === true)}
          />
          <Label htmlFor="anonymous" className="text-sm font-normal text-muted-foreground cursor-pointer">
            Make this an anonymous gift (hide my name from public showcase).
          </Label>
        </div>

        <div className="rounded-xl bg-secondary/60 p-4 text-xs text-muted-foreground leading-relaxed">
          <p className="mb-1 text-sm font-semibold text-foreground">Your Generosity in Action</p>
          Your gift of <strong className="text-foreground">{formatMoney(amountCents)}</strong> directly funds
          school tuition, exercise books, school uniforms, and dedicated staff mentorship for vulnerable street children.
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Keep in touch</p>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <Checkbox
              checked={emailUpdates}
              onCheckedChange={(checked) => setValue("emailUpdates", checked === true)}
            />
            Receive email updates on child progress and impact
          </label>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold h-12 shadow-sm"
          size="lg"
        >
          {isSubmitting
            ? "Preparing Checkout…"
            : paymentMethod === "MOBILE_MONEY"
              ? `Proceed with Mobile Money (${formatMoney(amountCents)} / ≈ GH₵ ${estimatedGhs})`
              : `Complete Secure Donation (${formatMoney(amountCents)})`}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {paymentMethod === "MOBILE_MONEY"
            ? "📱 You will receive immediate USSD transfer instructions and a unique reference code"
            : "🔒 Secured with 256-bit SSL encryption via Stripe"}
        </p>
      </div>
    </form>
  );
}
