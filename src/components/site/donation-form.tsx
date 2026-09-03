"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
}: {
  childId?: string;
  childName?: string;
  designation: FormValues["designation"];
  defaultFrequency: FormValues["frequency"];
  prefillName?: string;
  prefillEmail?: string;
  momoEnabled?: boolean;
  momoProviderName?: string;
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
    },
  });

  const amountCents = watch("amountCents");
  const frequency = watch("frequency");
  const paymentMethod = watch("paymentMethod");
  const anonymous = watch("anonymous");
  const emailUpdates = watch("emailUpdates");
  const smsUpdates = watch("smsUpdates");
  const whatsappUpdates = watch("whatsappUpdates");

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {childName && (
        <div className="rounded-xl bg-secondary p-4 text-sm">
          You&apos;re supporting <span className="font-semibold">{childName}</span>
        </div>
      )}

      <div>
        <Label className="mb-3 block">Frequency</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["ONE_TIME", "MONTHLY"] as const).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setValue("frequency", freq)}
              className={cn(
                "rounded-lg border py-2.5 text-sm font-medium transition-colors",
                frequency === freq
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-input bg-card hover:bg-secondary"
              )}
            >
              {freq === "ONE_TIME" ? "One-time" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {momoEnabled && (
        <div>
          <Label className="mb-3 block">Payment Method</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["CARD", "MOBILE_MONEY"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setValue("paymentMethod", method)}
                className={cn(
                  "rounded-lg border py-2.5 text-sm font-medium transition-colors",
                  paymentMethod === method
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-input bg-card hover:bg-secondary"
                )}
              >
                {method === "CARD" ? "Card" : momoProviderName || "Mobile Money"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label className="mb-3 block">Amount</Label>
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
                "rounded-lg border py-2.5 text-sm font-medium transition-colors",
                amountCents === preset && !customAmount
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-input bg-card hover:bg-secondary"
              )}
            >
              {formatMoney(preset)}
            </button>
          ))}
        </div>
        <div className="mt-2">
          <Input
            type="number"
            min={5}
            placeholder="Custom amount (USD)"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              const dollars = Number(e.target.value);
              if (dollars > 0) setValue("amountCents", Math.round(dollars * 100));
            }}
          />
        </div>
        {errors.amountCents && <p className="mt-1 text-xs text-destructive">{errors.amountCents.message}</p>}
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h3 className="font-semibold">Who&apos;s Giving Today?</h3>

        <div className="mt-5 grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Select onValueChange={(v: string | null) => setValue("title", v ?? "")}>
            <SelectTrigger id="title">
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

        <div className="mt-4 grid gap-2">
          <Label htmlFor="donorName">Full Name</Label>
          <Input id="donorName" placeholder="Your full name" {...register("donorName")} />
          {errors.donorName && <p className="text-xs text-destructive">{errors.donorName.message}</p>}
        </div>

        <div className="mt-4 grid gap-2">
          <Label htmlFor="donorEmail">Email Address</Label>
          <Input id="donorEmail" type="email" placeholder="your@email.com" {...register("donorEmail")} />
          {errors.donorEmail && <p className="text-xs text-destructive">{errors.donorEmail.message}</p>}
        </div>

        <div className="mt-4 grid gap-2">
          <Label htmlFor="donorPhone">Phone Number</Label>
          <Input id="donorPhone" placeholder="+233 XX XXX XXXX" {...register("donorPhone")} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Checkbox
            id="anonymous"
            checked={anonymous}
            onCheckedChange={(checked) => setValue("anonymous", checked === true)}
          />
          <Label htmlFor="anonymous" className="text-sm font-normal">
            Make this an anonymous donation.
          </Label>
        </div>

        <div className="mt-6 rounded-lg bg-secondary p-4 text-xs text-muted-foreground">
          <p className="mb-1 text-sm font-semibold text-foreground">Your Impact</p>
          {formatMoney(amountCents)} provides school supplies for one child for a full term.
          Monthly donors receive regular updates about the children they support.
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold">Stay Connected</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-normal">
              <Checkbox
                checked={emailUpdates}
                onCheckedChange={(checked) => setValue("emailUpdates", checked === true)}
              />
              Email updates
            </label>
            <label className="flex items-center gap-2 text-sm font-normal">
              <Checkbox
                checked={smsUpdates}
                onCheckedChange={(checked) => setValue("smsUpdates", checked === true)}
              />
              SMS updates
            </label>
            <label className="flex items-center gap-2 text-sm font-normal">
              <Checkbox
                checked={whatsappUpdates}
                onCheckedChange={(checked) => setValue("whatsappUpdates", checked === true)}
              />
              WhatsApp messages
            </label>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-8 w-full rounded-full" size="lg">
          {isSubmitting
            ? "Redirecting…"
            : paymentMethod === "MOBILE_MONEY"
              ? "Continue to Mobile Money"
              : "Complete Donation"}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {paymentMethod === "MOBILE_MONEY" ? "📱 You'll get a reference to complete the transfer" : "🔒 100% Secure Donation"}
        </p>
      </div>
    </form>
  );
}
