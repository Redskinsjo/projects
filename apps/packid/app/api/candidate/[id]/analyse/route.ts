import { analyseCV } from "@repo/agents";
import dotenv from "dotenv";
import { NextResponse } from "next/server";
import path from "node:path";

export const runtime = "nodejs";

function loadAgentsEnv() {
  const cwd = process.cwd();
  const envPaths = [
    path.join(cwd, ".env.local"),
    path.join(cwd, ".env"),
    path.join(cwd, "../../packages/agents/.env"),
    path.join(cwd, "packages/agents/.env"),
  ];

  for (const envPath of envPaths) {
    dotenv.config({ path: envPath, override: false, quiet: true });
  }
}

function isUpload(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

function buildFileName(candidateId: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `analyse-cv-${candidateId}-${date}.txt`;
}

function logAnalysisError(candidateId: string, error: unknown) {
  console.error("Candidate analysis failed", {
    candidateId,
    error,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  loadAgentsEnv();

  const { id } = await params;
  const formData = await request.formData();
  const cv = formData.get("cv");
  const fichePoste = formData.get("fichePoste");
  const nomPoste = formData.get("nomPoste");

  if (!isUpload(cv)) {
    return NextResponse.json({ error: "Le CV est requis." }, { status: 400 });
  }

  const roleName = typeof nomPoste === "string" ? nomPoste.trim() : "";

  if (!isUpload(fichePoste) && !roleName) {
    return NextResponse.json(
      { error: "Ajoutez une fiche de poste ou un nom de poste." },
      { status: 400 },
    );
  }

  try {
    const result = await analyseCV(
      isUpload(fichePoste)
        ? {
            cv,
            fichePoste,
          }
        : {
            cv,
            nomPoste: roleName,
          },
    );

    return new Response(result.analyse, {
      headers: {
        "Content-Disposition": `attachment; filename="${buildFileName(id)}"`,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    logAnalysisError(id, error);

    return NextResponse.json(
      {
        error:
          "Impossible de préparer l'analyse. Vérifiez les fichiers puis réessayez.",
      },
      { status: 500 },
    );
  }
}
