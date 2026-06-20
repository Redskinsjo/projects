import { NextResponse } from "next/server";
import { createOrganizationSchema } from "@/app/lib/schemas";
import {
  createOrganizationForCurrentUser,
  isOrganizationNameAvailable,
} from "@/app/lib/server/authService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "";

  if (!name.trim()) {
    return NextResponse.json({ available: false });
  }

  return NextResponse.json({
    available: await isOrganizationNameAvailable(name),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createOrganizationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(
      await createOrganizationForCurrentUser(parsed.data),
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de creer l'organisation.",
      },
      { status: 400 },
    );
  }
}
