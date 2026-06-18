import { NextResponse } from "next/server";
import { completeInterviewSchema } from "@/app/lib/schemas";
import { completeConversation } from "@/app/lib/server/recruitmentService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = completeInterviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Conversation invalide." },
      { status: 400 },
    );
  }

  return NextResponse.json(await completeConversation(parsed.data.conversationId));
}
