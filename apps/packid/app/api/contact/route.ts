import { NextResponse } from "next/server";
import { contactFormSchema } from "@/app/lib/schemas";
import { sendContactEmail } from "@/app/lib/server/emailService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  try {
    const delivery = await sendContactEmail(parsed.data);

    return NextResponse.json({
      ok: true,
      simulated: delivery.simulated,
      message: delivery.simulated
        ? "Message enregistre en simulation. Configurez SMTP pour l'envoi reel."
        : "Votre message a bien ete envoye.",
    });
  } catch (error) {
    console.error("Contact email send failed", error);

    return NextResponse.json(
      { error: "Impossible d'envoyer le message pour le moment." },
      { status: 502 },
    );
  }
}
