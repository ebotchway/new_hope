"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  User,
  Users,
  Briefcase,
  Church,
  Gift,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Calendar,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitBrightenerRegistration } from "@/actions/inquiries";
import { brightenerRegistrationSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type { PartnershipType } from "@/generated/prisma/enums";

type FormValues = z.infer<typeof brightenerRegistrationSchema>;

interface CategoryDef {
  type: PartnershipType;
  title: string;
  badge: string;
  description: string;
  whoFor: string;
  involves: string;
  icon: typeof User;
  accentColor: string;
}

const BRIGHTENER_CATEGORIES: CategoryDef[] = [
  {
    type: "INDIVIDUAL",
    title: "Individual Brightener",
    badge: "Most Popular",
    description: "Sponsor a child's complete schooling or contribute monthly to our direct relief funds.",
    whoFor: "Individuals, parents, and dedicated benefactors wanting personal impact.",
    involves: "Direct academic sponsorship, termly letters, and mentorship updates.",
    icon: User,
    accentColor: "border-brand-primary text-brand-primary",
  },
  {
    type: "VOLUNTEER",
    title: "Volunteer Service",
    badge: "Hands-on",
    description: "Contribute your skills in classroom tutoring, health outreach, IT, or field mentorship.",
    whoFor: "Educators, medical personnel, trade instructors, counsellors, and passionate individuals.",
    involves: "Scheduled field sessions, youth mentoring, and skills workshops in Accra and Kumasi.",
    icon: HeartHandshake,
    accentColor: "border-emerald-600 text-emerald-600",
  },
  {
    type: "CORPORATE",
    title: "Corporate Partnership",
    badge: "Enterprise",
    description: "Anchor your company's CSR agenda with measurable, transparent community impact in Ghana.",
    whoFor: "Companies, financial institutions, tech firms, and local enterprises.",
    involves: "Vocational apprenticeship funding, matching gift programmes, and branded classroom labs.",
    icon: Briefcase,
    accentColor: "border-amber-600 text-amber-600",
  },
  {
    type: "CHURCH",
    title: "Church & Faith Group",
    badge: "Community",
    description: "Engage your congregation in practical Christian compassion and missions outreach.",
    whoFor: "Churches, mission committees, youth ministries, and faith-based organisations.",
    involves: "Congregational child sponsorship, seasonal shoe/book drives, and mission partnerships.",
    icon: Church,
    accentColor: "border-indigo-600 text-indigo-600",
  },
  {
    type: "GROUP",
    title: "Community & Alumni Group",
    badge: "Collaborative",
    description: "Pool contributions with your alumni network, work team, or social circle.",
    whoFor: "School alumni associations, fraternities/sororities, running clubs, and friend circles.",
    involves: "Collective project sponsorship, class cohort funding, and community builds.",
    icon: Users,
    accentColor: "border-teal-600 text-teal-600",
  },
  {
    type: "WILL_GIFT",
    title: "Legacy & Will Gift",
    badge: "Enduring",
    description: "Leave an enduring testament of hope that illuminates children's futures for generations.",
    whoFor: "Supporters wishing to include LivingHope in their estate planning or will.",
    involves: "Confidential planned giving consultation and perpetual scholarship endowments.",
    icon: Gift,
    accentColor: "border-purple-600 text-purple-600",
  },
];

export function BrightenerRegistrationFlow({
  defaultType = "INDIVIDUAL",
}: {
  defaultType?: PartnershipType;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<PartnershipType>(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ referenceId?: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(brightenerRegistrationSchema),
    defaultValues: {
      type: defaultType,
      name: "",
      email: "",
      phone: "",
      organization: "",
      role: "",
      skills: "",
      availability: "Weekends",
      preferredFrequency: "Monthly",
      message: "",
      agreementAccepted: true,
    },
  });

  const activeCategory = BRIGHTENER_CATEGORIES.find((c) => c.type === selectedType) ?? BRIGHTENER_CATEGORIES[0];

  const handleSelectCategory = (type: PartnershipType) => {
    setSelectedType(type);
    setValue("type", type);
    setStep(2);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await submitBrightenerRegistration(values);
      if (res.success) {
        setSuccessResult({ referenceId: res.referenceId });
        setStep(3);
      } else {
        setServerError(res.error || "Failed to submit registration. Please try again.");
      }
    } catch {
      setServerError("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3: SUCCESS STATE
  if (step === 3 && successResult) {
    return (
      <Card className="rounded-2xl border-emerald-500/30 bg-emerald-50/50 p-6 text-center dark:bg-emerald-950/20 sm:p-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold font-heading text-foreground sm:text-3xl">
          Welcome to the Brightener Community!
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
          Thank you for stepping forward to illuminate the future of vulnerable children in Ghana as a{" "}
          <strong className="text-foreground">{activeCategory.title}</strong>.
        </p>

        {successResult.referenceId && (
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg bg-card px-3.5 py-1.5 text-xs font-mono font-medium text-foreground border shadow-2xs">
            <span>Registration Ref:</span>
            <span className="font-bold text-brand-primary">{successResult.referenceId}</span>
          </div>
        )}

        <div className="mt-6 rounded-xl bg-card p-4 text-left border text-xs sm:text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand-primary" />
            Next Steps in Your Journey:
          </p>
          <p>1. Our partnerships coordinator will review your profile details within 24–48 business hours.</p>
          <p>2. You will receive an official onboarding email with introductory materials and relevant program schedules.</p>
          <p>3. A tailored orientation briefing will be arranged at your convenience.</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              setStep(1);
              setSuccessResult(null);
            }}
            variant="outline"
            className="rounded-xl"
          >
            Register Another Category
          </Button>
          <Button asChild className="rounded-xl bg-brand-navy text-white hover:bg-brand-navy-dark">
            <Link href="/sponsor-a-child">Browse Sponsorship Directory</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* STEP PROGRESS INDICATOR */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-xs font-bold",
              step === 1 ? "bg-brand-primary text-white" : "bg-emerald-600 text-white"
            )}
          >
            {step === 1 ? "1" : "✓"}
          </span>
          <span className={cn("text-sm font-semibold", step === 1 ? "text-foreground" : "text-muted-foreground")}>
            Choose Category
          </span>
        </div>

        <div className="h-px w-12 bg-border sm:w-24" />

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-xs font-bold",
              step === 2 ? "bg-brand-primary text-white" : "bg-muted text-muted-foreground"
            )}
          >
            2
          </span>
          <span className={cn("text-sm font-semibold", step === 2 ? "text-foreground" : "text-muted-foreground")}>
            Category Information
          </span>
        </div>
      </div>

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold font-heading text-foreground sm:text-3xl">
              Choose How You Want to Participate
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Every Brightener category is uniquely designed around how you or your organisation can create maximum, sustained impact.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BRIGHTENER_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedType === cat.type;

              return (
                <Card
                  key={cat.type}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md border-2",
                    isSelected
                      ? "border-brand-primary bg-brand-primary/5 shadow-sm"
                      : "border-border/60 bg-card hover:border-brand-primary/40"
                  )}
                  onClick={() => handleSelectCategory(cat.type)}
                >
                  <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={cn("flex size-11 items-center justify-center rounded-xl bg-background border shadow-2xs", cat.accentColor)}>
                          <Icon className="size-5" />
                        </span>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {cat.badge}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-foreground font-heading">{cat.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                          {cat.description}
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground space-y-1">
                        <p><strong className="text-foreground">Ideal for:</strong> {cat.whoFor}</p>
                        <p><strong className="text-foreground">Involves:</strong> {cat.involves}</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className={cn(
                        "w-full rounded-xl mt-auto text-xs font-semibold",
                        isSelected
                          ? "bg-brand-primary text-white hover:bg-brand-primary-hover"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCategory(cat.type);
                      }}
                    >
                      <span>Continue as {cat.title.split(" ")[0]}</span>
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: CATEGORY-SPECIFIC FORM */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4 border">
            <div className="flex items-center gap-3">
              <span className={cn("flex size-10 items-center justify-center rounded-lg bg-background border shadow-2xs", activeCategory.accentColor)}>
                <activeCategory.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Registering as</p>
                <h3 className="text-base font-bold text-foreground font-heading">{activeCategory.title}</h3>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Change Category
            </Button>
          </div>

          {serverError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              {serverError}
            </div>
          )}

          {/* DIVERGENT CATEGORY FIELDS */}

          {/* Category: VOLUNTEER */}
          {selectedType === "VOLUNTEER" && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/30 p-4 dark:bg-emerald-950/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                <Award className="size-4 text-emerald-600" />
                <span>Volunteer Skills & Availability Details</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="skills" className="text-xs font-medium">
                    Skills / Specialty Area <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    defaultValue="Teaching & Remedial Tutoring"
                    onValueChange={(v) => { if (v) setValue("skills", v); }}
                  >
                    <SelectTrigger id="skills" className="bg-background">
                      <SelectValue placeholder="Select primary skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teaching & Remedial Tutoring">Teaching & Remedial Tutoring</SelectItem>
                      <SelectItem value="Healthcare & Nursing Screening">Healthcare & Nursing Screening</SelectItem>
                      <SelectItem value="Counselling & Emotional Wellness">Counselling & Emotional Wellness</SelectItem>
                      <SelectItem value="Vocational Trades & Craftsmanship">Vocational Trades & Craftsmanship</SelectItem>
                      <SelectItem value="IT, Coding & Digital Literacy">IT, Coding & Digital Literacy</SelectItem>
                      <SelectItem value="Arts, Music & Youth Sports">Arts, Music & Youth Sports</SelectItem>
                      <SelectItem value="Event Coordination & Logistics">Event Coordination & Logistics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="availability" className="text-xs font-medium">
                    Expected Availability <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    defaultValue="Weekends"
                    onValueChange={(v) => { if (v) setValue("availability", v); }}
                  >
                    <SelectTrigger id="availability" className="bg-background">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekends (Saturdays)">Weekends (Saturdays)</SelectItem>
                      <SelectItem value="Weekdays (After-school)">Weekdays (After-school)</SelectItem>
                      <SelectItem value="Flexible / Bi-weekly">Flexible / Bi-weekly</SelectItem>
                      <SelectItem value="School Holidays / Summer">School Holidays / Summer</SelectItem>
                      <SelectItem value="Remote Mentorship">Remote Mentorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Category: CORPORATE, GROUP, CHURCH */}
          {(selectedType === "CORPORATE" || selectedType === "GROUP" || selectedType === "CHURCH") && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-50/30 p-4 dark:bg-amber-950/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                <Building2 className="size-4 text-amber-600" />
                <span>Organisation Details</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="organization" className="text-xs font-medium">
                    {selectedType === "CHURCH" ? "Church / Congregation Name" : selectedType === "GROUP" ? "Group / Alumni Name" : "Company / Enterprise Name"} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="organization"
                    placeholder={selectedType === "CHURCH" ? "e.g. Grace Baptist Accra" : "e.g. Accra Tech Hub Ltd"}
                    className="bg-background"
                    {...register("organization", { required: true })}
                  />
                  {errors.organization && (
                    <p className="text-[11px] text-destructive">Organisation name is required</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs font-medium">
                    Your Role / Title in Organisation
                  </Label>
                  <Input
                    id="role"
                    placeholder="e.g. CSR Director, Lead Pastor, Alumni President"
                    className="bg-background"
                    {...register("role")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category: INDIVIDUAL */}
          {selectedType === "INDIVIDUAL" && (
            <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-wide">
                <Calendar className="size-4" />
                <span>Giving Frequency & Focus Preference</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="preferredFrequency" className="text-xs font-medium">
                    Preferred Frequency
                  </Label>
                  <Select
                    defaultValue="Monthly"
                    onValueChange={(v) => { if (v) setValue("preferredFrequency", v); }}
                  >
                    <SelectTrigger id="preferredFrequency" className="bg-background">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly ($25-$50)">Monthly ($25-$50)</SelectItem>
                      <SelectItem value="Termly ($100-$150)">Termly ($100-$150)</SelectItem>
                      <SelectItem value="Annual ($300-$600)">Annual ($300-$600)</SelectItem>
                      <SelectItem value="Custom General Project">Custom General Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="areas" className="text-xs font-medium">
                    Priority Area
                  </Label>
                  <Select
                    defaultValue="Child Academic Sponsorship"
                    onValueChange={(v) => { if (v) setValue("skills", v); }}
                  >
                    <SelectTrigger id="areas" className="bg-background">
                      <SelectValue placeholder="Select focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Child Academic Sponsorship">Child Academic Sponsorship</SelectItem>
                      <SelectItem value="Street Outreach & Feeding">Street Outreach & Feeding</SelectItem>
                      <SelectItem value="Vocational Apprenticeship">Vocational Apprenticeship</SelectItem>
                      <SelectItem value="Emergency Healthcare Fund">Emergency Healthcare Fund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Category: WILL_GIFT */}
          {selectedType === "WILL_GIFT" && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-50/30 p-4 dark:bg-purple-950/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wide">
                <Gift className="size-4 text-purple-600" />
                <span>Legacy Intention & Confidentiality</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All inquiries regarding wills, trusts, and legacy bequests are handled in strict fiduciary confidence by our board of trustees.
              </p>
            </div>
          )}

          {/* CONTACT & PERSONAL DETAILS (Common, essential) */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1.5">
              Contact Representative Information
            </h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Kwesi Mensah"
                  className="bg-card"
                  {...register("name")}
                />
                {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. kwesi@example.com"
                  className="bg-card"
                  {...register("email")}
                />
                {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="phone" className="text-xs font-medium">
                  Phone Number (Optional / WhatsApp enabled)
                </Label>
                <Input
                  id="phone"
                  placeholder="+233 24 000 0000"
                  className="bg-card"
                  {...register("phone")}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="message" className="text-xs font-medium">
                  Additional Notes, Aspirations, or Questions
                </Label>
                <Textarea
                  id="message"
                  rows={3}
                  placeholder="Tell us a little more about your motivations or specific goals..."
                  className="bg-card"
                  {...register("message")}
                />
              </div>

              {/* Safeguarding & Code of Conduct Agreement */}
              <div className="space-y-1 sm:col-span-2 pt-2">
                <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-input text-brand-navy focus:ring-brand-navy"
                    {...register("agreementAccepted")}
                  />
                  <span>
                    I confirm that the details provided are accurate and agree to abide by the LivingHope Child Protection Code of Conduct and Communications Policy. <span className="text-destructive">*</span>
                  </span>
                </label>
                {errors.agreementAccepted && (
                  <p className="text-[11px] text-destructive">{errors.agreementAccepted.message}</p>
                )}
              </div>

              {/* Honeypot field (hidden from users, traps automated bots) */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                {...register("companyHoneypot")}
              />
            </div>
          </div>

          {/* FORM CONTROLS */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setStep(1)}
              className="rounded-xl gap-2"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </Button>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="rounded-xl bg-brand-primary text-white hover:bg-brand-primary-hover shadow-md px-8"
            >
              {isSubmitting ? "Registering..." : `Complete ${activeCategory.title} Registration`}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
