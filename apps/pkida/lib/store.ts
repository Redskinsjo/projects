import { getDatabase } from "./prisma";
import type {
  Application as DbApplication,
  Research as DbResearch,
} from "@/app/generated/prisma/client";
import type {
  Application,
  ApplicationInput,
  ApplicationUpdate,
  Campaign,
  CampaignInput,
  Profile,
  User,
  UserData,
} from "./models";

const statusToDatabase = {
  "En cours": "IN_PROGRESS",
  Envoyée: "SENT",
  Entretien: "INTERVIEW",
  Acceptée: "ACCEPTED",
  Refusée: "REJECTED",
} as const;
const statusFromDatabase = {
  IN_PROGRESS: "En cours",
  SENT: "Envoyée",
  INTERVIEW: "Entretien",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
} as const;

export class RecordNotFoundError extends Error {}
async function ensureUser(user: User) {
  return getDatabase().user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      ...user,
      profile: { create: { name: user.name, email: user.email } },
    },
  });
}
function researchToClient(record: DbResearch): Campaign {
  return {
    id: record.id,
    title: record.title,
    role: record.role,
    location: record.location,
    salary: record.salary,
    experience: record.experience,
    contract: record.contract as Campaign["contract"],
    remote: record.remote as Campaign["remote"],
    pace: record.pace,
    keywords: record.keywords,
    exclusions: record.exclusions,
    review: record.review,
    status: "Préparée",
    createdAt: record.createdAt.toISOString(),
  };
}
function applicationToClient(record: DbApplication): Application {
  return {
    id: record.id,
    company: record.company,
    role: record.role,
    location: record.location,
    date: record.date.toISOString(),
    status: statusFromDatabase[record.status],
    researchId: record.researchId,
    sourceUrl: record.sourceUrl,
    notes: record.notes,
  };
}
export async function readData(user: User): Promise<UserData> {
  await ensureUser(user);
  const record = await getDatabase().user.findUniqueOrThrow({
    where: { id: user.id },
    include: {
      profile: true,
      researches: { orderBy: { createdAt: "desc" } },
      applications: { orderBy: { date: "desc" } },
      // Do not load the binary PDF when rendering the dashboard.
      cv: { select: { name: true, size: true, uploadedAt: true } },
    },
  });
  const profile = record.profile;
  return {
    profile: {
      name: profile?.name ?? user.name,
      email: profile?.email ?? user.email,
      phone: profile?.phone ?? "",
      role: profile?.role ?? "",
      location: profile?.location ?? "",
      salary: profile?.salary ?? 40000,
      experience: profile?.experience ?? 0,
      about: profile?.about ?? "",
    },
    campaigns: record.researches.map(researchToClient),
    applications: record.applications.map(applicationToClient),
    ...(record.cv
      ? { cv: { ...record.cv, uploadedAt: record.cv.uploadedAt.toISOString() } }
      : {}),
  };
}
export async function saveProfile(user: User, profile: Profile) {
  await ensureUser(user);
  await getDatabase().profile.upsert({
    where: { userId: user.id },
    create: { ...profile, userId: user.id },
    update: profile,
  });
}
export async function createResearch(user: User, input: CampaignInput) {
  await ensureUser(user);
  return researchToClient(
    await getDatabase().research.create({
      data: { ...input, userId: user.id },
    }),
  );
}
export async function listApplications(user: User) {
  return (
    await getDatabase().application.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    })
  ).map(applicationToClient);
}
export async function createApplication(user: User, input: ApplicationInput) {
  await ensureUser(user);
  const db = getDatabase();
  if (
    input.researchId &&
    !(await db.research.findFirst({
      where: { id: input.researchId, userId: user.id },
      select: { id: true },
    }))
  ) {
    throw new RecordNotFoundError("Recherche introuvable.");
  }
  return applicationToClient(
    await db.application.create({
      data: {
        ...input,
        userId: user.id,
        status: statusToDatabase[input.status],
        date: input.date ? new Date(input.date) : undefined,
      },
    }),
  );
}
export async function updateApplication(
  user: User,
  id: string,
  input: ApplicationUpdate,
) {
  // Scope the mutation itself, not only a prior read, to the signed-in account.
  const updated = await getDatabase().application.updateManyAndReturn({
    where: { id, userId: user.id },
    data: {
      ...input,
      status: input.status ? statusToDatabase[input.status] : undefined,
    },
  });
  if (!updated[0]) throw new RecordNotFoundError("Candidature introuvable.");
  return applicationToClient(updated[0]);
}
export async function saveResume(user: User, name: string, content: Buffer) {
  await ensureUser(user);
  const data = {
    name,
    content: new Uint8Array(content),
    size: content.byteLength,
    uploadedAt: new Date(),
  };
  const result = await getDatabase().resume.upsert({
    where: { userId: user.id },
    create: { ...data, userId: user.id },
    update: data,
    select: { name: true, size: true, uploadedAt: true },
  });
  return { ...result, uploadedAt: result.uploadedAt.toISOString() };
}
export async function readResume(user: User) {
  return getDatabase().resume.findUnique({ where: { userId: user.id } });
}
export async function deleteResume(user: User) {
  await getDatabase().resume.deleteMany({ where: { userId: user.id } });
}
