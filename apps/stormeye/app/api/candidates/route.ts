import { NextResponse } from "next/server";
import { getAllCandidates } from "@/app/lib/server/candidateService";

export async function GET() {
  const candidates = await getAllCandidates();
  return NextResponse.json(candidates);
}
