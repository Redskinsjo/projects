import { generateInterviewQuestion, generateReport } from "@repo/ai";
import {
  calculateRecruitmentScore,
  recommendationFromScore,
} from "@repo/scoring";
import {
  buildInterviewInvitationMessage,
  sendInterviewInvitation,
} from "@repo/whatsapp";
import type {
  CommunicationChannel,
  InvitationDeliveryStatus,
} from "@/app/generated/prisma/client";
import crypto from "node:crypto";
import { prisma } from "../prisma";

function splitSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function getInterviewUrl(origin: string, token: string) {
  return `${origin.replace(/\/$/, "")}/interview/${token}`;
}

type InvitationInput = {
  candidateId: string;
  channel: CommunicationChannel;
};

type CandidateContact = {
  firstName: string;
  lastName: string;
  email?: string | null;
  phoneNumber?: string | null;
};

function candidateName(candidate: CandidateContact) {
  return `${candidate.firstName} ${candidate.lastName}`.trim();
}

function assertContactForChannel(
  candidate: CandidateContact,
  channel: CommunicationChannel,
) {
  if ((channel === "WHATSAPP" || channel === "SMS") && !candidate.phoneNumber) {
    throw new Error("Un numero de telephone est requis pour ce canal.");
  }

  if (channel === "EMAIL" && !candidate.email) {
    throw new Error("Une adresse email est requise pour ce canal.");
  }
}

async function sendInvitationMessage(input: {
  channel: CommunicationChannel;
  candidate: CandidateContact;
  interviewUrl: string;
}): Promise<{ message: string; status: InvitationDeliveryStatus }> {
  const message = buildInterviewInvitationMessage({
    phoneNumber: input.candidate.phoneNumber,
    candidateName: candidateName(input.candidate),
    interviewUrl: input.interviewUrl,
  });

  if (input.channel === "WHATSAPP") {
    try {
      const result = await sendInterviewInvitation({
        phoneNumber: input.candidate.phoneNumber,
        candidateName: candidateName(input.candidate),
        interviewUrl: input.interviewUrl,
      });

      return {
        message: result.message,
        status: result.sent ? "SENT" : "SIMULATED",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Envoi WhatsApp impossible.";

      return {
        message: errorMessage,
        status: "FAILED",
      };
    }
  }

  if (input.channel === "SMS") {
    const configured = Boolean(process.env.SMS_PROVIDER_API_KEY);
    console.info("SMS invitation", {
      simulated: !configured,
      phoneNumber: input.candidate.phoneNumber,
      interviewUrl: input.interviewUrl,
    });

    return {
      message,
      status: configured ? "SENT" : "SIMULATED",
    };
  }

  const configured = Boolean(process.env.EMAIL_PROVIDER_API_KEY);
  console.info("Email invitation", {
    simulated: !configured,
    email: input.candidate.email,
    interviewUrl: input.interviewUrl,
  });

  return {
    message,
    status: configured ? "SENT" : "SIMULATED",
  };
}

export async function getDashboardData() {
  const [companies, jobs, candidates, reports] = await Promise.all([
    prisma.company.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.jobOffer.findMany({
      include: { company: true, _count: { select: { candidates: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.candidate.findMany({
      include: {
        jobOffer: { include: { company: true } },
        reports: { orderBy: { createdAt: "desc" }, take: 1 },
        invitationTokens: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    }),
    prisma.report.findMany(),
  ]);

  const completed = candidates.filter((candidate) =>
    ["COMPLETED", "ANALYZED", "SHORTLISTED", "REJECTED", "HIRED"].includes(
      candidate.status,
    ),
  ).length;
  const scoreValues = candidates
    .map((candidate) => candidate.score)
    .filter((score): score is number => typeof score === "number");

  return {
    companies,
    jobs,
    candidates,
    reports,
    kpis: {
      candidates: candidates.length,
      completed,
      averageScore:
        scoreValues.length > 0
          ? Math.round(
              scoreValues.reduce((total, score) => total + score, 0) /
                scoreValues.length,
            )
          : 0,
      completionRate:
        candidates.length > 0 ? Math.round((completed / candidates.length) * 100) : 0,
    },
  };
}

export async function getCompanies() {
  return prisma.company.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getJobOffers() {
  return prisma.jobOffer.findMany({
    include: { company: true, _count: { select: { candidates: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCandidates() {
  return prisma.candidate.findMany({
    include: {
      jobOffer: { include: { company: true } },
      reports: { orderBy: { createdAt: "desc" }, take: 1 },
      invitationTokens: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
  });
}

export async function getCandidateById(id: string) {
  return prisma.candidate.findUnique({
    where: { id },
    include: {
      jobOffer: { include: { company: true } },
      conversations: {
        include: { messages: { orderBy: { createdAt: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
      reports: { orderBy: { createdAt: "desc" } },
      invitationTokens: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}


export async function updateCandidate(
  id: string,
  input: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    resumeUrl?: string;
  },
) {
  return prisma.candidate.update({
    where: { id },
    data: {
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.email !== undefined ? { email: input.email || null } : {}),
      ...(input.phoneNumber !== undefined
        ? { phoneNumber: input.phoneNumber || null }
        : {}),
      ...(input.resumeUrl !== undefined ? { resumeUrl: input.resumeUrl || null } : {}),
    },
  });
}

export async function createCompany(input: { name: string }) {
  return prisma.company.create({ data: input });
}

export async function createRecruiter(input: {
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
}) {
  return prisma.recruiter.create({ data: input });
}

export async function createJobOffer(input: {
  title: string;
  description: string;
  requiredSkills: string;
  companyId?: string;
  companyName: string;
}) {
  const companyName = input.companyName.trim();
  const existingCompany = input.companyId
    ? await prisma.company.findUnique({ where: { id: input.companyId } })
    : await prisma.company.findFirst({
        where: { name: { equals: companyName, mode: "insensitive" } },
      });
  const company =
    existingCompany ??
    (await prisma.company.create({
      data: { name: companyName },
    }));

  return prisma.jobOffer.create({
    data: {
      title: input.title,
      description: input.description,
      requiredSkills: splitSkills(input.requiredSkills),
      companyId: company.id,
    },
  });
}

export async function createCandidate(
  input: {
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    resumeUrl?: string;
    jobOfferId: string;
    invitationMode?: "create" | "createAndNotify";
    communicationChannel?: CommunicationChannel;
  },
  origin: string,
) {
  const candidate = await prisma.candidate.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email || null,
      phoneNumber: input.phoneNumber || null,
      resumeUrl: input.resumeUrl || null,
      jobOfferId: input.jobOfferId,
    },
    include: {
      jobOffer: true,
      invitationTokens: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (input.invitationMode !== "createAndNotify") {
    return { candidate, invitation: null, interviewUrl: "" };
  }

  if (!input.communicationChannel) {
    throw new Error("Choisissez un canal de communication.");
  }

  const invitation = await inviteCandidate(
    { candidateId: candidate.id, channel: input.communicationChannel },
    origin,
  );

  return invitation;
}

export async function inviteCandidate(input: InvitationInput, origin: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: input.candidateId },
    include: {
      jobOffer: true,
      invitationTokens: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!candidate) {
    throw new Error("Candidat introuvable.");
  }

  assertContactForChannel(candidate, input.channel);

  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const interviewUrl = getInterviewUrl(origin, token);

  const invitationToken = await prisma.invitationToken.create({
    data: {
      candidateId: candidate.id,
      token,
      expiresAt,
      channel: input.channel,
      deliveryStatus: "PENDING",
    },
  });

  const delivery = await sendInvitationMessage({
    channel: input.channel,
    candidate,
    interviewUrl,
  });

  const invitation = await prisma.invitationToken.update({
    where: { id: invitationToken.id },
    data: {
      deliveryStatus: delivery.status,
      deliveryMessage: delivery.message,
      sentAt: new Date(),
    },
  });

  const updatedCandidate = await prisma.candidate.findUniqueOrThrow({
    where: { id: candidate.id },
    include: {
      jobOffer: true,
      invitationTokens: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return {
    candidate: updatedCandidate,
    invitation,
    interviewUrl,
  };
}

export async function startInterview(token: string) {
  const invitation = await prisma.invitationToken.findUnique({
    where: { token },
    include: {
      candidate: {
        include: { jobOffer: true },
      },
    },
  });

  if (!invitation || invitation.expiresAt < new Date()) {
    throw new Error("Invitation invalide ou expiree.");
  }

  const existing = await prisma.conversation.findFirst({
    where: { candidateId: invitation.candidateId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return { candidate: invitation.candidate, conversation: existing };
  }

  const requiredSkills = Array.isArray(invitation.candidate.jobOffer.requiredSkills)
    ? invitation.candidate.jobOffer.requiredSkills.map(String)
    : [];
  const firstQuestion = await generateInterviewQuestion({
    jobTitle: invitation.candidate.jobOffer.title,
    jobDescription: invitation.candidate.jobOffer.description,
    requiredSkills,
    candidateName: `${invitation.candidate.firstName} ${invitation.candidate.lastName}`,
    messages: [],
  });

  const conversation = await prisma.conversation.create({
    data: {
      candidateId: invitation.candidateId,
      messages: {
        create: [
          {
            role: "SYSTEM",
            content:
              "Entretien IA Packid. Objectif: verifier competences, experience, coherence et motivation.",
          },
          {
            role: "ASSISTANT",
            content: firstQuestion,
          },
        ],
      },
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  await prisma.$transaction([
    prisma.invitationToken.update({
      where: { id: invitation.id },
      data: { usedAt: invitation.usedAt ?? new Date() },
    }),
    prisma.candidate.update({
      where: { id: invitation.candidateId },
      data: { status: "STARTED" },
    }),
  ]);

  return { candidate: invitation.candidate, conversation };
}

export async function appendInterviewMessage(input: {
  conversationId: string;
  content: string;
}) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: input.conversationId },
    include: {
      candidate: { include: { jobOffer: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation || conversation.completedAt) {
    throw new Error("Conversation introuvable ou terminee.");
  }

  await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      role: "USER",
      content: input.content,
    },
  });

  const messages = [
    ...conversation.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    { role: "USER" as const, content: input.content },
  ];
  const requiredSkills = Array.isArray(conversation.candidate.jobOffer.requiredSkills)
    ? conversation.candidate.jobOffer.requiredSkills.map(String)
    : [];
  const assistantCount = messages.filter(
    (message) => message.role === "ASSISTANT",
  ).length;

  if (assistantCount >= 5) {
    await completeConversation(input.conversationId);
    return prisma.conversation.findUniqueOrThrow({
      where: { id: input.conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  const nextQuestion = await generateInterviewQuestion({
    jobTitle: conversation.candidate.jobOffer.title,
    jobDescription: conversation.candidate.jobOffer.description,
    requiredSkills,
    candidateName: `${conversation.candidate.firstName} ${conversation.candidate.lastName}`,
    messages,
  });

  await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      role: "ASSISTANT",
      content: nextQuestion,
    },
  });

  return prisma.conversation.findUniqueOrThrow({
    where: { id: input.conversationId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function completeConversation(conversationId: string) {
  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { completedAt: new Date(), candidate: { update: { status: "COMPLETED" } } },
    include: { candidate: true },
  });

  return conversation;
}

export async function generateCandidateReport(candidateId: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      jobOffer: true,
      conversations: {
        include: { messages: { orderBy: { createdAt: "asc" } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!candidate) {
    throw new Error("Candidat introuvable.");
  }

  const hasResume = Boolean(candidate.resumeUrl?.trim());
  const conversation = candidate.conversations[0];
  const messages = conversation?.messages ?? [];
  const hasCandidateAnswer = messages.some((message) => message.role === "USER");

  if (!hasResume && !hasCandidateAnswer) {
    throw new Error(
      "Ajoutez un CV ou collectez au moins une reponse du candidat avant de generer un rapport.",
    );
  }

  const requiredSkills = Array.isArray(candidate.jobOffer.requiredSkills)
    ? candidate.jobOffer.requiredSkills.map(String)
    : [];
  const generated = await generateReport({
    jobTitle: candidate.jobOffer.title,
    jobDescription: candidate.jobOffer.description,
    requiredSkills,
    candidateName: `${candidate.firstName} ${candidate.lastName}`,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    transcript: messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n"),
  });
  const score = calculateRecruitmentScore(generated.scoreSignals);
  const recommendation = recommendationFromScore(score);

  const report = await prisma.report.create({
    data: {
      candidateId,
      summary: generated.summary,
      strengths: generated.strengths,
      weaknesses: generated.weaknesses,
      estimatedLevel: generated.estimatedLevel,
      score,
      recommendation,
    },
  });

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { score, status: "ANALYZED" },
  });

  return report;
}
