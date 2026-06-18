import { NextResponse } from "next/server";
import { loginSchema } from "@/app/lib/schemas";
import { loginWithPassword } from "@/app/lib/server/authService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  try {
    const user = await loginWithPassword(parsed.data);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Email ou mot de passe incorrect." },
      { status: 401 },
    );
  }
}
