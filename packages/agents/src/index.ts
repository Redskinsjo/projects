import OpenAI from "openai";
import pdf from "pdf-parse";
import "dotenv/config";

const DEFAULT_MODEL = "gpt-4o-mini";

type FileLike = {
  arrayBuffer(): Promise<ArrayBuffer>;
};

export type AnalyseCVFile = Buffer | ArrayBuffer | Uint8Array | FileLike;

export type AnalyseCVInput =
  | {
      cv: AnalyseCVFile;
      fichePoste: AnalyseCVFile;
      nomPoste?: never;
    }
  | {
      cv: AnalyseCVFile;
      nomPoste: string;
      fichePoste?: never;
    };

export type AnalyseCVOptions = {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export type AnalyseCVResult = {
  analyse: string;
  model: string;
};

function isFileLike(file: AnalyseCVFile): file is FileLike {
  return typeof (file as FileLike).arrayBuffer === "function";
}

async function readFileContent(file: AnalyseCVFile): Promise<Buffer> {
  if (Buffer.isBuffer(file)) {
    return file;
  }

  if (file instanceof ArrayBuffer) {
    return Buffer.from(file);
  }

  if (isFileLike(file)) {
    return Buffer.from(await file.arrayBuffer());
  }

  return Buffer.from(file as Uint8Array);
}

async function extractPdfText(file: AnalyseCVFile): Promise<string> {
  const data = await readFileContent(file);
  const parser = new pdf.PDFParse({ data });

  try {
    const result = await parser.getText();

    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

function buildPrompt(
  input: AnalyseCVInput,
  cvText: string,
  fichePosteText?: string,
) {
  if ("fichePoste" in input) {
    return [
      "Analyse ce CV par rapport a la fiche de poste fournie.",
      "Donne une evaluation claire de l'adequation du profil, les points forts, les ecarts, les risques et des recommandations concretes.",
      "",
      `CV:\n${cvText}`,
      "",
      `Fiche de poste:\n${fichePosteText ?? ""}`,
    ].join("\n");
  }

  return [
    `Analyse ce CV pour le poste suivant: ${input.nomPoste}.`,
    "Donne une evaluation claire de l'adequation du profil, les points forts, les ecarts, les risques et des recommandations concretes.",
    "",
    `CV:\n${cvText}`,
  ].join("\n");
}

export async function analyseCV(
  input: AnalyseCVInput,
  options: AnalyseCVOptions = {},
): Promise<AnalyseCVResult> {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY est requis pour appeler analyseCV.");
  }

  const model = options.model ?? DEFAULT_MODEL;
  const client = new OpenAI({ apiKey });
  const cvText = await extractPdfText(input.cv);
  const fichePosteText =
    "fichePoste" in input && input.fichePoste
      ? await extractPdfText(input.fichePoste)
      : undefined;

  const result = await client.chat.completions.create({
    model,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 900,
    messages: [
      {
        role: "user",
        content: buildPrompt(input, cvText, fichePosteText),
      },
    ],
  });

  return {
    analyse: result.choices[0]?.message.content ?? "",
    model,
  };
}
