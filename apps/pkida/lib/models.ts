import { z } from "zod";
export const profileSchema = z.object({
  name: z.string().trim().max(120),
  email: z.union([z.email(), z.literal("")]),
  phone: z.string().max(40),
  location: z.string().trim().max(150),
  role: z.string().trim().max(150),
  salary: z.number().min(0).max(1000000),
  experience: z.number().min(0).max(70),
  about: z.string().max(3000),
});
export type Profile = z.infer<typeof profileSchema>;
export const campaignSchema = z.object({
  title: z.string().trim().min(2).max(150),
  role: z.string().trim().min(2).max(150),
  location: z.string().trim().min(2).max(150),
  salary: z.number().min(0).max(1000000),
  experience: z.number().min(0).max(70),
  contract: z.enum(["CDI", "CDD", "Freelance", "Alternance", "Stage"]),
  remote: z.enum(["Hybride", "Sur site", "Télétravail"]),
  pace: z.number().int().min(1).max(20),
  keywords: z.string().max(500),
  exclusions: z.string().max(500),
  review: z.boolean(),
});
export type CampaignInput = z.infer<typeof campaignSchema>;
export type Campaign = CampaignInput & {
  id: string;
  createdAt: string;
  status: "Préparée";
};
export type Application = {
  researchId?: string | null;
  sourceUrl?: string | null;
  notes?: string;
  id: string;
  company: string;
  role: string;
  location: string;
  date: string;
  status: "En cours" | "Envoyée" | "Entretien" | "Acceptée" | "Refusée";
};
export type UserData = {
  profile: Profile;
  campaigns: Campaign[];
  applications: Application[];
  cv?: { name: string; size: number; uploadedAt: string };
};
export type User = { id: string; name: string; email: string };

export const applicationStatusSchema = z.enum([
  "En cours",
  "Envoyée",
  "Entretien",
  "Acceptée",
  "Refusée",
]);
export const applicationSchema = z.object({
  company: z.string().trim().min(1).max(150),
  role: z.string().trim().min(1).max(150),
  location: z.string().trim().max(150),
  status: applicationStatusSchema.default("En cours"),
  researchId: z.uuid().nullable().optional(),
  date: z.iso.datetime().optional(),
  sourceUrl: z
    .url({ protocol: /^https?$/ })
    .nullable()
    .optional(),
  notes: z.string().max(5000).default(""),
});
export const applicationUpdateSchema = z
  .object({
    status: applicationStatusSchema.optional(),
    notes: z.string().max(5000).optional(),
  })
  .refine((value) => value.status !== undefined || value.notes !== undefined);
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationUpdate = z.infer<typeof applicationUpdateSchema>;
