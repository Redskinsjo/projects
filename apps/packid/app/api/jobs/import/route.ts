import { NextResponse } from "next/server";
import {
  extractJobFileText,
  parseImportedJob,
} from "@/app/lib/server/jobImportService";
import { getCompanies } from "@/app/lib/server/recruitmentService";

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

    if (text.length < 20) {
      return NextResponse.json(
        {
          error:
            "Ajoutez un fichier ou collez un texte d'offre suffisamment lisible.",
        },
        { status: 400 },
      );
    }

    const companies = await getCompanies();
    const imported = parseImportedJob(text, companies);

    return NextResponse.json({
      imported,
      textLength: text.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Lecture du fichier impossible.",
      },
      { status: 400 },
    );
  }
}
