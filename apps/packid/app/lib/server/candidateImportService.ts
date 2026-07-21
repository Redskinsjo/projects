type JobOption = {
  id: string;
  title: string;
  company: {
    name: string;
  };
};

export type ImportedCandidateData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  resumeUrl?: string;
  jobOfferId?: string;
};

const keyAliases: Record<keyof ImportedCandidateData, string[]> = {
  firstName: ["prenom", "prénom", "first name", "firstname", "given name"],
  lastName: ["nom", "last name", "lastname", "surname", "family name"],
  email: ["email", "e-mail", "mail", "adresse email", "courriel"],
  phoneNumber: [
    "telephone",
    "téléphone",
    "tel",
    "mobile",
    "portable",
    "whatsapp",
    "phone",
    "phone number",
  ],
  resumeUrl: ["cv", "resume", "résumé", "lien cv", "resume url", "linkedin"],
  jobOfferId: ["offre", "poste", "job", "job offer", "offre d'emploi"],
};

function normalizeText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanValue(value: string) {
  return value
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/^[\s\-*•·]+/, "")
    .trim();
}

function readKeyValueLines(text: string) {
  const pairs = new Map<string, string>();

  for (const line of text.split("\n")) {
    const cleanedLine = line.trim();
    if (!cleanedLine) continue;

    const match = cleanedLine.match(/^([^:=,\t;]{2,40})\s*[:=,\t;]\s*(.+)$/);
    if (!match) continue;

    pairs.set(normalizeKey(match[1]), cleanValue(match[2]));
  }

  return pairs;
}

function readMappedValue(
  pairs: Map<string, string>,
  field: keyof ImportedCandidateData,
) {
  const aliases = keyAliases[field].map(normalizeKey);
  const key = [...pairs.keys()].find((candidateKey) =>
    aliases.some(
      (alias) => candidateKey === alias || candidateKey.startsWith(`${alias} `),
    ),
  );

  return key ? pairs.get(key) : undefined;
}

function findEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
}

function findPhone(text: string) {
  const match = text.match(/(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{1,4}\)?[\s.-]?){5,}/);
  return match?.[0]?.replace(/\s{2,}/g, " ").trim();
}

function findUrl(text: string) {
  return text.match(/https?:\/\/[^\s)]+/i)?.[0];
}

function splitName(value: string) {
  const cleaned = cleanValue(value)
    .replace(/^(candidat|candidate|nom complet|full name)\s*[:=,\-–—]\s*/i, "")
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length < 2) return {};

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function findName(text: string) {
  const labeled = text.match(
    /^(?:candidat|candidate|nom complet|full name)\s*[:=,\-–—]\s*(.+)$/im,
  )?.[1];
  if (labeled) return splitName(labeled);

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
  const likelyName = lines.find((line) => {
    const words = line.split(/\s+/).filter(Boolean);
    return (
      words.length >= 2 &&
      words.length <= 4 &&
      line.length <= 80 &&
      !line.includes("@") &&
      !/\d/.test(line) &&
      !/^https?:\/\//i.test(line) &&
      !/^(cv|profil|resume|curriculum|telephone|email)\b/i.test(line)
    );
  });

  return likelyName ? splitName(likelyName) : {};
}

function findJobOfferId(value: string | undefined, text: string, jobs: JobOption[]) {
  const searchable = normalizeKey([value, text].filter(Boolean).join(" "));

  const scoredJobs = jobs
    .map((job, index) => {
      const title = normalizeKey(job.title.replace(/\(.*?\)/g, ""));
      const titleWords = title.split(" ").filter((word) => word.length >= 3);
      const matchedTitleWords = titleWords.filter((word) =>
        searchable.includes(word),
      ).length;
      const titleScore = titleWords.length
        ? matchedTitleWords / titleWords.length
        : 0;
      const company = normalizeKey(job.company.name);
      const companyScore = company.length >= 3 && searchable.includes(company) ? 0.7 : 0;

      return {
        id: job.id,
        index,
        score:
          (title.length >= 3 && searchable.includes(title) ? 1 : titleScore) +
          companyScore,
      };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return scoredJobs[0]?.score >= 0.6 ? scoredJobs[0].id : undefined;
}

export function parseImportedCandidate(
  rawText: string,
  jobs: JobOption[],
): ImportedCandidateData {
  const text = normalizeText(rawText);
  const pairs = readKeyValueLines(text);
  const inferredName = findName(text);
  const fullName =
    readMappedValue(pairs, "firstName") && readMappedValue(pairs, "lastName")
      ? undefined
      : pairs.get("nom complet") ?? pairs.get("full name") ?? pairs.get("candidat");

  const splitFullName = fullName ? splitName(fullName) : {};
  const jobValue = readMappedValue(pairs, "jobOfferId");

  return {
    firstName:
      readMappedValue(pairs, "firstName") ??
      splitFullName.firstName ??
      inferredName.firstName,
    lastName:
      readMappedValue(pairs, "lastName") ??
      splitFullName.lastName ??
      inferredName.lastName,
    email: readMappedValue(pairs, "email") ?? findEmail(text),
    phoneNumber: readMappedValue(pairs, "phoneNumber") ?? findPhone(text),
    resumeUrl: readMappedValue(pairs, "resumeUrl") ?? findUrl(text),
    jobOfferId: findJobOfferId(jobValue, text, jobs),
  };
}
