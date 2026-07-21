import { NextResponse } from "next/server";
import { parseImportedCandidate } from "@/app/lib/server/candidateImportService";
import { extractJobFileText } from "@/app/lib/server/jobImportService";
import { getJobOffers } from "@/app/lib/server/recruitmentService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const pastedText = formData.get("text");

  try {
    let text = typeof pastedText === "string" ? pastedText : "";

    if (file instanceof File) {
      if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Le fichier est trop volumineux. Limite: 8 Mo." },
          { status: 400 },
        );
      }

      text = await extractJobFileText(file);
    }

    if (text.trim().length < 3) {
      return NextResponse.json(
        { error: "Ajoutez un fichier ou collez des informations candidat." },
        { status: 400 },
      );
    }

    const jobs = await getJobOffers();
    const imported = parseImportedCandidate(text, jobs);

    return NextResponse.json({ imported });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Lecture des informations candidat impossible.",
      },
      { status: 400 },
    );
  }
}
