import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/app/lib/schemas";
import { resetPasswordWithToken } from "@/app/lib/server/authService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  try {
    await resetPasswordWithToken(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Reinitialisation du mot de passe impossible.",
      },
      { status: 400 },
    );
  }
}
