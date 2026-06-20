import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

type CompanyOption = {
  id: string;
  name: string;
};

export type ImportedJobData = {
  companyId?: string;
  companyName?: string;
  title?: string;
  description?: string;
  requiredSkills?: string;
};

const sectionLabels = [
  "titre",
  "poste",
  "intitule",
  "intitulé",
  "entreprise",
  "societe",
  "société",
  "company",
  "description",
  "missions",
  "mission",
  "contexte",
  "profil",
  "competences",
  "compétences",
  "skills",
  "prerequis",
  "prérequis",
  "technologies",
  "stack",
  "outils",
  "environnement technique",
  "type de contrat",
  "lieu",
  "expérience",
  "experience",
];

const skillCatalog: Array<{ name: string; aliases: string[] }> = [
  { name: "React", aliases: ["react", "react.js", "reactjs"] },
  { name: "Next.js", aliases: ["next.js", "nextjs"] },
  { name: "Vue.js", aliases: ["vue.js", "vuejs", "vue js"] },
  { name: "Angular", aliases: ["angular", "angularjs"] },
  { name: "Node.js", aliases: ["node.js", "nodejs", "node js"] },
  { name: "TypeScript", aliases: ["typescript"] },
  { name: "JavaScript", aliases: ["javascript", "js"] },
  { name: "Python", aliases: ["python"] },
  { name: "Java", aliases: ["java"] },
  { name: "C#", aliases: ["c#"] },
  { name: ".NET", aliases: [".net", "dotnet"] },
  { name: "PHP", aliases: ["php"] },
  { name: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { name: "MySQL", aliases: ["mysql"] },
  { name: "MongoDB", aliases: ["mongodb", "mongo db"] },
  { name: "GraphQL", aliases: ["graphql"] },
  { name: "REST APIs", aliases: ["api rest", "rest api", "rest"] },
  { name: "Docker", aliases: ["docker"] },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { name: "AWS", aliases: ["aws", "amazon web services"] },
  { name: "Azure", aliases: ["azure"] },
  { name: "Figma", aliases: ["figma"] },
  { name: "UI Design", aliases: ["ui", "interfaces modernes", "interface"] },
  { name: "UX Design", aliases: ["ux", "experience utilisateur", "expérience utilisateur"] },
  { name: "Wireframing", aliases: ["wireframe", "wireframes"] },
  { name: "Prototyping", aliases: ["prototype", "prototypes", "prototypes interactifs"] },
  { name: "Design System", aliases: ["design system"] },
  { name: "Responsive Design", aliases: ["responsive", "design responsive", "mobile"] },
  { name: "User Research", aliases: ["recherche utilisateur", "recherches utilisateurs"] },
  { name: "Usability Testing", aliases: ["tests d'utilisabilité", "test utilisateur", "tests utilisateurs"] },
  { name: "Accessibility", aliases: ["accessible", "accessibilite", "accessibilité"] },
  { name: "HTML", aliases: ["html"] },
  { name: "CSS", aliases: ["css"] },
  { name: "Agile", aliases: ["agile", "scrum"] },
  { name: "SEO", aliases: ["seo"] },
  { name: "CRM", aliases: ["crm", "salesforce", "hubspot"] },
];

function normalizeText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "\n")
    .replace(/^--\s*\d+\s+of\s+\d+\s*--$/gim, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeForMatch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim();
}

function readLabeledLine(text: string, labels: string[]) {
  const escapedLabels = labels.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(
    `^\\s*(?:${escapedLabels.join("|")})\\s*[:=,;\\t\\-–—]\\s*(.+)$`,
    "im",
  );
  return text.match(pattern)?.[1]?.trim();
}

function readLabeledBlock(text: string, labels: string[]) {
  const escapedLabels = labels.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const escapedSections = sectionLabels.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(
    `^\\s*(?:${escapedLabels.join("|")})\\s*[:=,;\\t\\-–—]?\\s*\\n?([\\s\\S]+?)(?=^\\s*(?:${escapedSections.join("|")})\\s*[:=,;\\t\\-–—]|\\n\\s*\\n\\s*[A-ZÀ-Ÿ][^\\n]{2,60}\\n|\\s*$)`,
    "im",
  );
  return text.match(pattern)?.[1]?.trim();
}

function looksLikeKeyValueText(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return false;

  const keyedLines = lines.filter((line) =>
    /^[^:=,\t;]{2,40}\s*[:=,\t;]/.test(line),
  );

  return keyedLines.length / lines.length >= 0.5;
}

function findCompanyId(companyName: string | undefined, companies: CompanyOption[]) {
  if (!companyName) return undefined;
  const normalized = normalizeForMatch(companyName);
  return companies.find(
    (company) => normalizeForMatch(company.name) === normalized,
  )?.id;
}

function findCompanyInText(text: string, companies: CompanyOption[]) {
  const normalizedText = normalizeForMatch(text);
  return companies.find((company) => {
    const name = normalizeForMatch(company.name);
    return name.length >= 3 && normalizedText.includes(name);
  })?.id;
}

function inferCompanyName(text: string) {
  const labeled =
    readLabeledLine(text, ["entreprise", "societe", "société", "company"]) ??
    readLabeledBlock(text, ["entreprise", "societe", "société", "company"])
      ?.split("\n")
      .map((line) => line.trim())
      .find((line) => line.length >= 2 && line.length <= 100);

  if (labeled && !/^description\b/i.test(labeled)) {
    return cleanCompanyName(labeled);
  }

  const companySentence = text.match(
    /^([A-ZÀ-Ÿ][^\n]{2,100}?)\s+est\s+une\s+entreprise\b/im,
  );
  if (companySentence?.[1]) return cleanCompanyName(companySentence[1]);

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const firstLine = lines[0];
  const secondLine = lines[1];

  if (
    firstLine &&
    secondLine &&
    /offre\s+d['’]emploi|poste|recrut/i.test(secondLine) &&
    firstLine.length <= 100
  ) {
    return cleanCompanyName(firstLine);
  }

  return undefined;
}

function cleanCompanyName(value: string) {
  return value
    .replace(/\s+est\s+une\s+entreprise.*$/i, "")
    .replace(/^entreprise\s*[:\-–—]\s*/i, "")
    .trim()
    .slice(0, 120);
}

function findTitle(text: string, companyName?: string) {
  const labeled = readLabeledLine(text, [
    "titre",
    "poste",
    "intitule",
    "intitulé",
    "job title",
    "offre d'emploi",
    "offre d’emploi",
  ]);

  if (labeled) return cleanTitle(labeled);

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);
  const titleLike = lines.find((line) => {
    const normalized = normalizeForMatch(line);
    return (
      line.length >= 4 &&
      line.length <= 90 &&
      normalizeForMatch(line) !== normalizeForMatch(companyName ?? "") &&
      !normalized.startsWith("description") &&
      !normalized.startsWith("entreprise") &&
      !normalized.startsWith("offre d emploi") &&
      !normalized.includes("@") &&
      !/^https?:\/\//i.test(line) &&
      !/^\d/.test(line)
    );
  });

  if (titleLike) return cleanTitle(titleLike);

  const sentenceMatch = text.match(
    /(?:nous recrutons|nous recherchons|recherche|recrute)\s+(?:un|une|des)?\s*([^.\n]{4,90})/i,
  );
  return sentenceMatch?.[1] ? cleanTitle(sentenceMatch[1]) : undefined;
}

function cleanTitle(value: string) {
  return value
    .replace(/^(offre\s+d['’]emploi|fiche\s+de\s+poste)\s*[:\-–—]\s*/i, "")
    .trim()
    .slice(0, 120);
}

function findSkills(text: string) {
  const normalizedText = normalizeForMatch(text);
  const found = skillCatalog
    .filter((skill) =>
      skill.aliases.some((alias) => normalizedText.includes(normalizeForMatch(alias))),
    )
    .map((skill) => skill.name);

  return [...new Set(found)].join(", ") || undefined;
}

export function parseImportedJob(
  rawText: string,
  companies: CompanyOption[],
): ImportedJobData {
  const text = normalizeText(rawText);
  const companyName = inferCompanyName(text);
  const companyId =
    findCompanyId(companyName, companies) ?? findCompanyInText(text, companies);
  const explicitDescription = readLabeledBlock(text, ["description", "descriptif"]);

  return {
    companyId,
    companyName,
    title: findTitle(text, companyName),
    description: looksLikeKeyValueText(text) && explicitDescription
      ? explicitDescription
      : text,
    requiredSkills: findSkills(text),
  };
}

function stripRtf(value: string) {
  return value
    .replace(/\\'[0-9a-fA-F]{2}/g, " ")
    .replace(/\\[a-zA-Z]+-?\d* ?/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/\s+/g, " ");
}

export async function extractJobFileText(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = file.type;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (extension === "pdf" || mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return normalizeText(result.text);
    } finally {
      await parser.destroy();
    }
  }

  if (
    extension === "docx" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return normalizeText(result.value);
  }

  const text = buffer.toString("utf8");

  if (extension === "rtf" || mimeType === "application/rtf") {
    return normalizeText(stripRtf(text));
  }

  if (
    extension === "txt" ||
    extension === "md" ||
    extension === "csv" ||
    extension === "json" ||
    extension === "html" ||
    extension === "htm" ||
    mimeType.startsWith("text/") ||
    mimeType === "application/json"
  ) {
    return normalizeText(text.replace(/<[^>]+>/g, " "));
  }

  if (extension === "doc") {
    throw new Error(
      "Les anciens fichiers .doc ne sont pas lisibles automatiquement. Enregistrez le document en .docx ou PDF.",
    );
  }

  throw new Error(
    "Format non supporte. Utilisez PDF, DOCX, RTF, TXT, Markdown, HTML, CSV ou JSON.",
  );
}
