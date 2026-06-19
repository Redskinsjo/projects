import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/app/lib/schemas";
import { requestPasswordReset } from "@/app/lib/server/authService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  try {
    await requestPasswordReset({
      email: parsed.data.email,
      requestUrl: request.url,
    });
  } catch (error) {
    console.error("Password reset request failed", error);
  }

  return NextResponse.json({
    ok: true,
    message:
      "Si un compte email et mot de passe existe pour cette adresse, un lien de reinitialisation vient d'etre envoye.",
  });
}
