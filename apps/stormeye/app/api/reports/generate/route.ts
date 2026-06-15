import { NextResponse } from "next/server";
import { generateReportSchema } from "@/app/lib/schemas";
import { generateCandidateReport } from "@/app/lib/server/recruitmentService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = generateReportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Candidat invalide." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await generateCandidateReport(parsed.data.candidateId));
  } catch {
    return NextResponse.json(
      { error: "Impossible de generer le rapport." },
      { status: 500 },
    );
  }
}
