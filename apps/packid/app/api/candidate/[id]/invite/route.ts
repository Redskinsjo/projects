import { NextResponse } from "next/server";
import { inviteCandidateSchema } from "@/app/lib/schemas";
import { inviteCandidate } from "@/app/lib/server/recruitmentService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = inviteCandidateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  try {
    const origin = new URL(request.url).origin;
    const result = await inviteCandidate(
      { candidateId: id, channel: parsed.data.communicationChannel },
      origin,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible d'avertir le candidat.",
      },
      { status: 400 },
    );
  }
}
