import { NextResponse } from "next/server";
import { createCompanySchema } from "@/app/lib/schemas";
import {
  createCompany,
  getCompanies,
} from "@/app/lib/server/recruitmentService";

export async function GET() {
  return NextResponse.json(await getCompanies());
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createCompanySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  return NextResponse.json(await createCompany(parsed.data), { status: 201 });
}
