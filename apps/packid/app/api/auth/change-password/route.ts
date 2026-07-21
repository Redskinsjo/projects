import { NextResponse } from "next/server";
import { changePasswordSchema } from "@/app/lib/schemas";
import { changePassword, getCurrentUser } from "@/app/lib/server/authService";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Connectez-vous pour modifier votre mot de passe." },
      { status: 401 },
    );
  }

  if (!user.passwordCredential) {
    return NextResponse.json(
      { error: "La connexion email et mot de passe n'est pas active sur ce compte." },
      { status: 400 },
    );
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  try {
    await changePassword({
      userId: user.id,
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Modification du mot de passe impossible.",
      },
      { status: 400 },
    );
  }
}
