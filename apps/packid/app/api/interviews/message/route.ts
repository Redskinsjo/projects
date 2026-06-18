import { NextResponse } from "next/server";
import { interviewMessageSchema } from "@/app/lib/schemas";
import { appendInterviewMessage } from "@/app/lib/server/recruitmentService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = interviewMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Message invalide." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await appendInterviewMessage(parsed.data));
  } catch {
    return NextResponse.json(
      { error: "Impossible d'envoyer cette reponse." },
      { status: 500 },
    );
  }
}
