import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN &&
    challenge
  ) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json(
    { error: "Verification WhatsApp invalide." },
    { status: 403 },
  );
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  console.info("WhatsApp webhook received", {
    object:
      payload && typeof payload === "object" && "object" in payload
        ? payload.object
        : undefined,
  });

  return NextResponse.json({ ok: true });
}
