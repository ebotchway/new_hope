"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  generalInquirySchema,
  type GeneralInquiryInput,
} from "@/lib/validations";
import { submitGeneralInquiry } from "@/actions/inquiries";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";

const INQUIRY_TOPICS = [
  { value: "GENERAL", label: "General Information & Inquiries" },
  { value: "SPONSORSHIP", label: "Child Sponsorship Questions" },
  { value: "DONATION", label: "Donations, Tax Receipts & Wire Transfers" },
  { value: "VOLUNTEERING", label: "Volunteer Opportunities & Requirements" },
  { value: "VISITING", label: "Visiting Our Center in Accra" },
  { value: "MEDIA_PRESS", label: "Media, Press & Academic Research" },
  { value: "OTHER", label: "Other Inquiries" },
];

export function GeneralInquiryForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GeneralInquiryInput>({
    resolver: zodResolver(generalInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      inquiryType: "GENERAL",
      subject: "",
      message: "",
      companyHoneypot: "",
    },
  });

  const onSubmit = async (data: GeneralInquiryInput) => {
    setServerError(null);
    try {
      const result = await submitGeneralInquiry(data);
      if (result.success) {
        setSubmittedName(data.name);
        setSuccess(true);
        reset();
      } else {
        setServerError(result.error ?? "Failed to submit inquiry. Please try again.");
      }
    } catch {
      setServerError("An unexpected network error occurred. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center sm:p-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground">
          Thank you, {submittedName}!
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Your inquiry has been received by the LivingHope administration team in Accra. We typically respond within 1–2 business days.
        </p>
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSuccess(false)}
            className="rounded-full border-emerald-600/30 text-emerald-700 hover:bg-emerald-50"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <p>{serverError}</p>
        </div>
      )}

      {/* Honeypot field for bot protection */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="companyHoneypot">Leave this field blank</label>
        <input
          id="companyHoneypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("companyHoneypot")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Ama Mensah"
            aria-invalid={!!errors.name}
            {...register("name")}
            className="rounded-xl"
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. ama@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
            className="rounded-xl"
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone / WhatsApp Number <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. +233 24 123 4567"
            aria-invalid={!!errors.phone}
            {...register("phone")}
            className="rounded-xl"
          />
          {errors.phone && (
            <p className="text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inquiryType" className="text-sm font-medium">
            Topic of Inquiry <span className="text-red-500">*</span>
          </Label>
          <select
            id="inquiryType"
            {...register("inquiryType")}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {INQUIRY_TOPICS.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
          {errors.inquiryType && (
            <p className="text-xs text-red-600">{errors.inquiryType.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject" className="text-sm font-medium">
          Subject <span className="text-red-500">*</span>
        </Label>
        <Input
          id="subject"
          placeholder="Brief summary of your inquiry"
          aria-invalid={!!errors.subject}
          {...register("subject")}
          className="rounded-xl"
        />
        {errors.subject && (
          <p className="text-xs text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-sm font-medium">
          Your Message <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Please write your questions or comments here. Include any helpful details..."
          aria-invalid={!!errors.message}
          {...register("message")}
          className="rounded-xl resize-none"
        />
        {errors.message && (
          <p className="text-xs text-red-600">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white px-8 py-2.5 font-medium flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending Message...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Send Inquiry
          </>
        )}
      </Button>
    </form>
  );
}
