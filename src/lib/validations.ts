import { z } from "zod";

export const donationSchema = z.object({
  title: z.string().optional(),
  donorName: z.string().min(2, "Full name is required"),
  donorEmail: z.email("A valid email is required"),
  donorPhone: z.string().optional(),
  anonymous: z.boolean(),
  amountCents: z.number().int().min(500, "Minimum donation is $5"),
  frequency: z.enum(["ONE_TIME", "MONTHLY"]),
  designation: z.enum(["GENERAL", "CHILD_SPONSORSHIP", "PARTNERSHIP"]),
  childId: z.string().optional(),
  emailUpdates: z.boolean(),
  smsUpdates: z.boolean(),
  whatsappUpdates: z.boolean(),
});

export const partnershipInquirySchema = z.object({
  type: z.enum(["INDIVIDUAL", "GROUP", "CORPORATE", "CHURCH", "WILL_GIFT", "VOLUNTEER"]),
  name: z.string().min(2, "Name is required"),
  email: z.email("A valid email is required"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.email("A valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const childSchema = z.object({
  name: z.string().min(2, "Name is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().optional(),
  bio: z.string().min(10, "Bio should be at least 10 characters"),
  school: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["AVAILABLE", "SPONSORED", "GRADUATED"]).default("AVAILABLE"),
  featured: z.boolean().default(false),
  fundingGoalCents: z.coerce.number().int().min(0).default(0),
});

export const storySchema = z.object({
  name: z.string().min(2, "Name is required"),
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

export const siteSettingsSchema = z.object({
  heroHeadline: z.string().min(2),
  heroSubheadline: z.string().min(2),
  missionTitle: z.string().min(2),
  missionBody: z.string().min(2),
  facebookUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  contactEmail: z.email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
});
