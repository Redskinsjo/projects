import { prisma } from "../prisma";

export async function getCandidateById(id: string) {
  return prisma.candidate.findUnique({
    where: { id },
  });
}

export async function getAllCandidates() {
  return prisma.candidate.findMany();
}
