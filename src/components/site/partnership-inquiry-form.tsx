"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { partnershipInquirySchema } from "@/lib/validations";
import { submitPartnershipInquiry } from "@/actions/inquiries";
import { PARTNERSHIP_TYPES } from "@/lib/partnership-types";
import type { z } from "zod";

type FormValues = z.infer<typeof partnershipInquirySchema>;

export function PartnershipInquiryForm({ defaultType }: { defaultType?: FormValues["type"] }) {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(partnershipInquirySchema),
    defaultValues: {
      type: defaultType ?? "INDIVIDUAL",
      name: "",
      email: "",
      phone: "",
      message: "",
      companyHoneypot: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const result = await submitPartnershipInquiry(values);
      if (result.success) {
        setSubmitted(true);
        toast.success("Thank you! We'll be in touch soon.");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Couldn't send that — check your connection and try again.");
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-secondary p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground">Thank you for reaching out!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          A member of our team will contact you shortly to discuss next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 rounded-2xl bg-secondary p-6 sm:p-8">
      <input
        type="text"
        {...register("companyHoneypot")}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />
      <div className="grid gap-2">
        <Label htmlFor="type">Partnership type</Label>
        <Select value={watch("type")} onValueChange={(v) => setValue("type", v as FormValues["type"])}>
          <SelectTrigger id="type" className="bg-card">
            <SelectValue>
              {(v: FormValues["type"]) => PARTNERSHIP_TYPES.find((o) => o.type === v)?.title ?? v}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PARTNERSHIP_TYPES.map((option) => (
              <SelectItem key={option.type} value={option.type}>
                {option.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" className="bg-card" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="bg-card" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" className="bg-card" {...register("phone")} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Tell us a bit about how you&apos;d like to partner (optional)</Label>
        <Textarea id="message" className="bg-card" rows={4} {...register("message")} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="justify-self-start rounded-full">
        {isSubmitting ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}
