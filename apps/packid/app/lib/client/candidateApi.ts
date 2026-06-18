import type { Candidate } from "@/app/generated/prisma/client";

const API_BASE = "/api";

export async function fetchCandidateById(id: string): Promise<Candidate> {
  const response = await fetch(`${API_BASE}/candidate/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Candidate ${id} not found`);
  }

  return response.json();
}

export async function fetchCandidates(): Promise<Candidate[]> {
  const response = await fetch(`${API_BASE}/candidates`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch candidates");
  }

  return response.json();
}
