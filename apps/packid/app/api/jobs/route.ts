import { NextResponse } from "next/server";
import { createJobOfferSchema } from "@/app/lib/schemas";
import {
  createJobOffer,
  getJobOffers,
} from "@/app/lib/server/recruitmentService";

export async function GET() {
  return NextResponse.json(await getJobOffers());
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createJobOfferSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 },
    );
  }

  return NextResponse.json(await createJobOffer(parsed.data), { status: 201 });
}
