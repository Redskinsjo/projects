import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import OpenAI from "openai";
import pdf from "pdf-parse";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const filename = path.join(
  os.homedir(),
  "Desktop/fichiers/_/pro/travail/CVpages/CV_2026-06-03_JONATHAN_CARNOS.pdf",
);

async function giveOpinion() {
  const f = fs.readFileSync(filename);
  const parser = new pdf.PDFParse({ data: f });
  const t = await parser.getText();

  const result = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 1,
    frequency_penalty: 1,
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: `que penses-tu de ce CV: '${t.text}'.`,
      },
    ],
  });

  const res = result.choices[0].message.content;
  console.log(res);
}

giveOpinion();
