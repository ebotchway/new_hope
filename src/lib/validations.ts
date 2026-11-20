import { z } from "zod";

export const donationSchema = z.object({
  title: z.string().optional(),
  donorName: z.string().min(2, "Full name is required").max(100),
  donorEmail: z.string().email("A valid email is required"),
  donorPhone: z.string().max(30).optional(),
  anonymous: z.boolean(),
  amountCents: z.number().int().min(500, "Minimum donation is $5"),
  frequency: z.enum(["ONE_TIME", "MONTHLY"]),
  designation: z.enum(["GENERAL", "CHILD_SPONSORSHIP", "PARTNERSHIP"]),
  paymentMethod: z.enum(["CARD", "MOBILE_MONEY"]),
  childId: z.string().optional(),
  emailUpdates: z.boolean(),
  smsUpdates: z.boolean(),
  whatsappUpdates: z.boolean(),
  companyHoneypot: z.string().optional(),
});

export const partnershipInquirySchema = z.object({
  type: z.enum(["INDIVIDUAL", "GROUP", "CORPORATE", "CHURCH", "WILL_GIFT", "VOLUNTEER"]),
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("A valid email is required"),
  phone: z.string().max(30).optional(),
  message: z.string().max(2000).optional(),
  companyHoneypot: z.string().optional(),
});

export const brightenerRegistrationSchema = z.object({
  type: z.enum(["INDIVIDUAL", "GROUP", "CORPORATE", "CHURCH", "WILL_GIFT", "VOLUNTEER"]),
  name: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("A valid email address is required"),
  phone: z.string().max(30).optional(),
  organization: z.string().max(120).optional(),
  role: z.string().max(80).optional(),
  skills: z.string().max(250).optional(),
  availability: z.string().max(100).optional(),
  preferredFrequency: z.string().max(50).optional(),
  areasOfInterest: z.array(z.string()).optional(),
  message: z.string().max(2000).optional(),
  agreementAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the partnership terms and safeguarding code",
  }),
  companyHoneypot: z.string().optional(),
});

export const generalInquirySchema = z.object({
  name: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("A valid email address is required"),
  phone: z.string().max(30).optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150),
  inquiryType: z.enum([
    "GENERAL",
    "SPONSORSHIP",
    "DONATION",
    "VOLUNTEER",
    "VISIT",
    "MEDIA",
    "OTHER",
  ]),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
  companyHoneypot: z.string().optional(),
});

export type BrightenerRegistrationInput = z.infer<typeof brightenerRegistrationSchema>;
export type GeneralInquiryInput = z.infer<typeof generalInquirySchema>;

export const updateDonorProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().max(30).optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name is required").max(100),
    email: z.string().email("A valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("A valid email is required"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const childSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().optional(),
  bio: z.string().min(10, "Bio should be at least 10 characters"),
  school: z.string().max(120).optional(),
  location: z.string().max(120).optional(),
  status: z.enum(["AVAILABLE", "SPONSORED", "GRADUATED"]).default("AVAILABLE"),
  featured: z.boolean().default(false),
  archived: z.boolean().default(false),
  fundingGoalCents: z.coerce.number().int().min(0).default(0),
});

export const storySchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  age: z.coerce.number().int().positive().optional(),
  quote: z.string().min(5, "Quote is required"),
  published: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export const impactStatSchema = z.object({
  label: z.string().min(2, "Label is required"),
  value: z.string().min(1, "Value is required"),
  order: z.coerce.number().int().default(0),
  published: z.boolean().default(true),
});

export const historyEventSchema = z.object({
  year: z.string().min(4, "Year is required"),
  title: z.string().min(2, "Title is required"),
  bulletPoints: z.string().min(1, "Add at least one bullet point"),
  order: z.coerce.number().int().default(0),
  published: z.boolean().default(true),
});

export const trusteeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  title: z.string().optional(),
  order: z.coerce.number().int().default(0),
  published: z.boolean().default(true),
});

export const childUpdateSchema = z.object({
  title: z.string().min(2, "Title is required"),
  body: z.string().min(5, "Add a short update"),
  published: z.boolean().default(true),
});

export const siteSettingsSchema = z.object({
  heroHeadline: z.string().min(2),
  heroSubheadline: z.string().min(2),
  missionTitle: z.string().min(2),
  missionBody: z.string().min(2),
  facebookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  youtubeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  momoProvider: z.string().optional(),
  momoNumber: z.string().optional(),
  momoName: z.string().optional(),
  momoRateUsdToGhs: z.coerce.number().positive().default(15.5),
  momoInstructions: z.string().optional(),
  stripePublishableKey: z.string().trim().optional().or(z.literal("")),
  stripeSecretKey: z.string().trim().optional().or(z.literal("")),
  stripeWebhookSecret: z.string().trim().optional().or(z.literal("")),
  stripeMode: z.enum(["test", "live"]).default("test"),
});
