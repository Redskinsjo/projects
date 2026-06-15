import { NextResponse } from "next/server";
import { createCandidateSchema } from "@/app/lib/schemas";
import {
  createCandidate,
  getCandidates,
} from "@/app/lib/server/recruitmentService";

export async function GET() {
  const candidates = await getCandidates();
  return NextResponse.json(candidates);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createCandidateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;
  try {
    const result = await createCandidate(parsed.data, origin);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de creer le candidat.",
      },
      { status: 400 },
    );
  }
}
