import { NextResponse } from "next/server";
import { startInterviewSchema } from "@/app/lib/schemas";
import { startInterview } from "@/app/lib/server/recruitmentService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = startInterviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invitation invalide." }, { status: 400 });
  }

  try {
    return NextResponse.json(await startInterview(parsed.data.token));
  } catch {
    return NextResponse.json(
      { error: "Invitation invalide ou expiree." },
      { status: 404 },
    );
  }
}
