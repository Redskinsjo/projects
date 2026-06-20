import { NextResponse } from "next/server";
import { updateCandidateSchema } from "@/app/lib/schemas";
import {
  deleteArchivedCandidate,
  getCandidateById,
  updateCandidate,
} from "@/app/lib/server/recruitmentService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const candidate = await getCandidateById(id);
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }
  return NextResponse.json(candidate);
}


export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateCandidateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await updateCandidate(id, parsed.data));
  } catch {
    return NextResponse.json(
      { error: "Impossible de mettre a jour le candidat." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await deleteArchivedCandidate(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer le candidat.",
      },
      { status: 400 },
    );
  }
}
