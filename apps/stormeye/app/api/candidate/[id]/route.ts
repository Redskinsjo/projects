import { NextResponse } from "next/server";
import { getCandidateById } from "@/app/lib/server/recruitmentService";

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
