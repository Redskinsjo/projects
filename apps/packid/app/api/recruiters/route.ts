import { NextResponse } from "next/server";
import { createRecruiterSchema } from "@/app/lib/schemas";
import { createRecruiter } from "@/app/lib/server/recruitmentService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createRecruiterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  return NextResponse.json(await createRecruiter(parsed.data), { status: 201 });
}
