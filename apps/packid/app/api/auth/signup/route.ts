import { NextResponse } from "next/server";
import { signUpSchema } from "@/app/lib/schemas";
import { signUpWithPassword } from "@/app/lib/server/authService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  try {
    const user = await signUpWithPassword(parsed.data);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Un compte existe deja avec cet email." },
      { status: 409 },
    );
  }
}
