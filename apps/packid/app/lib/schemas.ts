import { z } from "zod";

export const communicationChannelSchema = z.enum(["WHATSAPP", "SMS", "EMAIL"]);

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Le nom de l'entreprise est requis."),
});

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2, "Le nom de l'organisation est requis."),
});

export const createRecruiterSchema = z.object({
  email: z.string().trim().email("Email recruteur invalide."),
  firstName: z.string().trim().min(1, "Le prenom est requis."),
  lastName: z.string().trim().min(1, "Le nom est requis."),
  companyId: z.string().trim().min(1, "L'entreprise est requise."),
});

export const createJobOfferSchema = z.object({
  title: z.string().trim().min(2, "Le titre de l'offre est requis."),
  description: z.string().trim().min(20, "La description est trop courte."),
  requiredSkills: z.string().trim().min(2, "Ajoutez au moins une competence."),
  companyId: z.string().trim().optional().or(z.literal("")),
  companyName: z.string().trim().min(2, "Le nom de l'entreprise est requis."),
});

export const createCandidateSchema = z.object({
  firstName: z.string().trim().min(1, "Le prenom est requis."),
  lastName: z.string().trim().min(1, "Le nom est requis."),
  email: z.string().trim().email().optional().or(z.literal("")),
  phoneNumber: z.string().trim().optional().or(z.literal("")),
  phoneCountryCode: z.string().trim().optional().or(z.literal("")),
  resumeUrl: z.string().trim().url().optional().or(z.literal("")),
  jobOfferId: z.string().trim().min(1, "L'offre est requise."),
  invitationMode: z.enum(["create", "createAndNotify"]).default("create"),
  communicationChannel: communicationChannelSchema.optional(),
}).superRefine((value, context) => {
  if (value.invitationMode === "createAndNotify" && !value.communicationChannel) {
    context.addIssue({
      code: "custom",
      path: ["communicationChannel"],
      message: "Choisissez un canal de communication.",
    });
  }
});


export const updateCandidateSchema = z.object({
  firstName: z.string().trim().min(1, "Le prenom est requis.").optional(),
  lastName: z.string().trim().min(1, "Le nom est requis.").optional(),
  email: z.string().trim().email("Email invalide.").optional().or(z.literal("")),
  phoneNumber: z.string().trim().optional().or(z.literal("")),
  phoneCountryCode: z.string().trim().optional().or(z.literal("")),
  resumeUrl: z.string().trim().url("Lien CV invalide.").optional().or(z.literal("")),
  archived: z.boolean().optional(),
});

export const inviteCandidateSchema = z.object({
  communicationChannel: communicationChannelSchema,
});

export const startInterviewSchema = z.object({
  token: z.string().trim().min(20, "Token invalide."),
});

export const interviewMessageSchema = z.object({
  conversationId: z.string().trim().min(1, "Conversation requise."),
  content: z.string().trim().min(2, "La reponse est trop courte."),
});

export const completeInterviewSchema = z.object({
  conversationId: z.string().trim().min(1, "Conversation requise."),
});

export const generateReportSchema = z.object({
  candidateId: z.string().trim().min(1, "Candidat requis."),
});

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "Le prenom est requis."),
  lastName: z.string().trim().min(1, "Le nom est requis."),
  email: z.string().trim().email("Email invalide.").toLowerCase(),
  password: z.string().min(10, "Le mot de passe doit contenir au moins 10 caracteres."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email invalide.").toLowerCase(),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis."),
  newPassword: z
    .string()
    .min(10, "Le nouveau mot de passe doit contenir au moins 10 caracteres."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email invalide.").toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(20, "Lien de reinitialisation invalide."),
  password: z.string().min(10, "Le mot de passe doit contenir au moins 10 caracteres."),
});
