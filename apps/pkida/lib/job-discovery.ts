import { getDatabase } from "./prisma";
import type { Company as DbCompany, Research as DbResearch } from "@/app/generated/prisma/client";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

type SearchResult = {
  title?: string;
  url?: string;
  description?: string;
  page_age?: string;
  profile?: { name?: string; long_name?: string; url?: string };
};
type SearchResponse = { web?: { results?: SearchResult[] } };

const JOB_BOARD_DOMAINS = [
  "jooble.org",
  "francetravail.fr",
  "cadremploi.fr",
  "hellowork.com",
  "indeed.com",
  "welcometothejungle.com",
  "glassdoor.com",
  "apec.fr",
  "monster.fr",
  "jobteaser.com",
  "stepstone.fr",
  "talent.com",
  "meteojob.com",
  "linkedin.com",
  "ziprecruiter.com",
  "simplyhired.com",
  "careerbuilder.com",
  "jobijoba.com",
  "jobijoba.fr",
  "agefiph.fr",
  "optioncarriere.com",
  "careerjet.fr",
  "careerjet.com",
  "jobrapido.com",
  "adzuna.fr",
  "adzuna.com",
  "joblift.fr",
  "joblift.com",
  "recrut.com",
  "emploi.org",
  "lesjeudis.com",
  "regionsjob.com",
  "emploipublic.fr",
  "choisirleservicepublic.gouv.fr",
  "emploi.lefigaro.fr",
  "emploi.lemonde.fr",
];
const SOCIAL_DOMAINS = [
  "linkedin.com",
  "x.com",
  "twitter.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
];
const CAREER_PATH =
  /(?:career|careers|carriere|carri[eè]re|recrut|emploi|jobs?|offres|opportunit|join-us|work-with-us|talent)/i;
const PLATFORM_NAMES =
  /^(linkedin|indeed|glassdoor|hellowork|jooble|france travail|cadremploi|welcome to the jungle|x|twitter|facebook|instagram|tiktok)$/i;

function cleanUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|trk|tracking|fbclid|gclid|mc_cid|mc_eid)/i.test(key))
        url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
}

function registrableDomain(hostname: string) {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  const parts = host.split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : host;
}

function matchesDomain(host: string, domains: string[]) {
  return domains.some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
}

function keywordTerms(value: string) {
  const groups = value.match(/"[^"]+"|'[^']+'|[^,;\n]+/g) ?? [];
  const terms = groups.flatMap((group) =>
    (group.match(/"[^"]+"|'[^']+'|\S+/g) ?? []).map((term) =>
      term.replace(/^['"]|['"]$/g, "").trim(),
    ),
  );
  return [...new Map(terms.filter(Boolean).map((term) => [term.toLocaleLowerCase("fr"), term])).values()];
}

function includesTerm(text: string, term: string) {
  const normalizedText = text.toLocaleLowerCase("fr").replace(/\s+/g, " ");
  const normalizedTerm = term.toLocaleLowerCase("fr").replace(/\s+/g, " ").trim();
  if (!normalizedTerm) return false;
  const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(?:^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`,
    "u",
  ).test(normalizedText);
}

function classifySocialSource(url: URL) {
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (matchesDomain(host, SOCIAL_DOMAINS)) {
    const isPost = host.endsWith("linkedin.com")
      ? /\/(posts\/|feed\/update\/|company\/[^/]+\/posts\/)/i.test(url.pathname)
      : host.endsWith("x.com") || host.endsWith("twitter.com")
        ? /\/[^/]+\/status\/\d+/i.test(url.pathname)
        : host.endsWith("facebook.com")
          ? /\/(posts\/|permalink\.php|story\.php)/i.test(url.pathname)
          : host.endsWith("instagram.com")
            ? /\/(p|reel)\//i.test(url.pathname)
            : /\/video\//i.test(url.pathname);
    return isPost ? ("SOCIAL_NETWORK" as const) : null;
  }
  return null;
}

function companyNameFromTitle(
  title: string,
  host: string,
  profileName?: string,
) {
  const profile = profileName?.trim();
  if (profile && !PLATFORM_NAMES.test(profile)) return profile;
  const withoutPlatform = title.replace(
    /\s*[|–—-]\s*(LinkedIn|Indeed|Glassdoor|Welcome to the Jungle|HelloWork)\s*$/i,
    "",
  );
  const at = withoutPlatform.match(
    /\b(?:chez|at|pour)\s+(.+?)(?:\s*[|–—-].*)?$/i,
  );
  if (at?.[1]) return at[1].trim();
  const pieces = withoutPlatform
    .split(/\s+[|–—-]\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (pieces.length > 1) {
    const candidate = pieces[pieces.length - 1];
    return PLATFORM_NAMES.test(candidate) ? pieces[0] : candidate;
  }
  if (pieces.length === 1 && pieces[0].includes(","))
    return pieces[0].split(",").at(-1)!.trim();
  if (matchesDomain(host, SOCIAL_DOMAINS)) return "";
  return registrableDomain(host).split(".")[0].replace(/[-_]/g, " ");
}

function scoreOffer(research: DbResearch, result: SearchResult) {
  const haystack =
    `${result.title ?? ""} ${result.description ?? ""}`.toLocaleLowerCase("fr");
  const description = (result.description ?? "").toLocaleLowerCase("fr");
  const roleWords = research.role
    .toLocaleLowerCase("fr")
    .split(/\W+/)
    .filter((word) => word.length > 2);
  const roleMatches = roleWords.filter((word) => haystack.includes(word));
  const keywordMatches = keywordTerms(research.keywords).filter((word) =>
    includesTerm(description, word),
  );
  const reasons = {
    roleWords: roleMatches,
    keywords: keywordMatches,
    location:
      research.location &&
      haystack.includes(research.location.toLocaleLowerCase("fr"))
        ? research.location
        : "",
  };
  return {
    score: Math.min(
      100,
      Math.round(
        (roleMatches.length / Math.max(1, roleWords.length)) * 55 +
          (keywordMatches.length ? 15 : 0) +
          (reasons.location ? 10 : 0) +
          20,
      ),
    ),
    reasons,
    keywordMatches,
    relevant:
      roleMatches.length >= Math.max(1, Math.ceil(roleWords.length / 2)),
  };
}

type PostingMetadata = {
  title?: string;
  description?: string;
  employmentType?: string;
  datePosted?: Date;
  validThrough?: Date;
  location?: string;
  workplaceType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  companyName?: string;
  companyDescription?: string;
  companyIndustry?: string;
  companyWebsite?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function findSchemaObjects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(findSchemaObjects);
  const record = asRecord(value);
  if (!record) return [];
  return [record, ...Object.values(record).flatMap(findSchemaObjects)];
}

function isSchemaType(value: unknown, type: string) {
  return (Array.isArray(value) ? value : [value]).some(
    (entry) =>
      typeof entry === "string" &&
      entry.toLowerCase().endsWith(type.toLowerCase()),
  );
}

function plainText(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stringField(value: unknown) {
  return typeof value === "string" && value.trim()
    ? plainText(value)
    : undefined;
}

function dateField(value: unknown) {
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function salaryFrom(value: unknown) {
  const monetary = asRecord(value);
  const salary = asRecord(monetary?.value) ?? monetary;
  const min = Number(salary?.minValue ?? salary?.value);
  const max = Number(salary?.maxValue ?? salary?.value);
  return {
    min: Number.isFinite(min) ? min : undefined,
    max: Number.isFinite(max) ? max : undefined,
    currency: stringField(monetary?.currency ?? salary?.currency),
  };
}

function extractPosting(html: string): PostingMetadata | null {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  const objects: Record<string, unknown>[] = [];
  for (const script of scripts) {
    try {
      objects.push(
        ...findSchemaObjects(
          JSON.parse(script[1].replace(/^\s*<!--|-->\s*$/g, "")),
        ),
      );
    } catch {
      // Ignore malformed JSON-LD and keep looking for other structured blocks.
    }
  }
  const posting = objects.find((item) =>
    isSchemaType(item["@type"], "JobPosting"),
  );
  if (!posting) return null;
  const organization = asRecord(posting.hiringOrganization);
  const standaloneOrganization = objects.find((item) =>
    isSchemaType(item["@type"], "Organization"),
  );
  const employer = organization ?? standaloneOrganization;
  const jobLocations = Array.isArray(posting.jobLocation)
    ? posting.jobLocation
    : [posting.jobLocation];
  const address = asRecord(asRecord(jobLocations[0])?.address);
  const locality = stringField(address?.addressLocality);
  const region = stringField(address?.addressRegion);
  const countryRecord = asRecord(address?.addressCountry);
  const country = stringField(countryRecord?.name ?? address?.addressCountry);
  const location = [locality, region, country].filter(Boolean).join(", ");
  const salary = salaryFrom(posting.baseSalary);
  const organizationIndustry = stringField(employer?.industry);
  return {
    title: stringField(posting.title),
    description: stringField(posting.description),
    employmentType: stringField(posting.employmentType),
    datePosted: dateField(posting.datePosted),
    validThrough: dateField(posting.validThrough),
    location: location || undefined,
    workplaceType: stringField(posting.jobLocationType),
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryCurrency: salary.currency,
    companyName: stringField(employer?.name),
    companyDescription: stringField(employer?.description),
    companyIndustry:
      organizationIndustry ?? stringField(organization?.knowsAbout),
    companyWebsite: stringField(employer?.sameAs) ?? stringField(employer?.url),
  };
}

function isPrivateAddress(address: string) {
  if (isIP(address) === 4) {
    const octets = address.split(".").map(Number);
    return (
      octets[0] === 0 ||
      octets[0] === 10 ||
      octets[0] === 127 ||
      octets[0] >= 224 ||
      (octets[0] === 169 && octets[1] === 254) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168) ||
      (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) ||
      (octets[0] === 198 && (octets[1] === 18 || octets[1] === 19))
    );
  }
  const normalized = address.toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

async function fetchHtml(url: URL): Promise<string | null> {
  if (
    url.protocol !== "https:" ||
    url.port ||
    isIP(url.hostname) ||
    url.hostname === "localhost" ||
    url.hostname.endsWith(".local")
  )
    return null;
  try {
    const addresses = await lookup(url.hostname, { all: true });
    if (
      !addresses.length ||
      addresses.some(({ address }) => isPrivateAddress(address))
    )
      return null;
    const response = await fetch(url, {
      redirect: "manual",
      headers: { Accept: "text/html", "User-Agent": "PKidaJobSearch/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    if (
      !response.ok ||
      response.status >= 300 ||
      !response.headers.get("content-type")?.includes("text/html")
    )
      return null;
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > 2_000_000) return null;
    return (await response.text()).slice(0, 2_000_000);
  } catch {
    return null;
  }
}

function postingFromHtml(html: string, research: DbResearch, result: SearchResult): PostingMetadata | null {
    const structuredPosting = extractPosting(html);
    if (structuredPosting) return structuredPosting;

    // Some company career pages do not publish JobPosting JSON-LD. Accept them
    // only after visiting the page and confirming both job and role signals.
    const text = plainText(html);
    const title = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
    const pageTitle = plainText(title ?? result.title ?? "");
    const jobSignal =
      /(?:postuler|candidater|offre d'emploi|offre d’emploi|job description|job opening|apply now|rejoignez|rejoindre nos équipes)/i.test(
        text,
      );
    const roleWords = research.role
      .toLocaleLowerCase("fr")
      .split(/\W+/)
      .filter((word) => word.length > 2);
    const roleHits = roleWords.filter((word) =>
      `${pageTitle} ${text}`.toLocaleLowerCase("fr").includes(word),
    );
    const keywords = keywordTerms(research.keywords);
    const keywordHit = keywords.some((word) => includesTerm(text, word));
    if (
      !jobSignal ||
      roleHits.length < Math.max(1, Math.ceil(roleWords.length / 2)) ||
      (keywords.length && !keywordHit)
    )
      return null;
    const metaDescription = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    )?.[1];
    return {
      title: pageTitle || undefined,
      description: plainText(metaDescription ?? "") || text.slice(0, 12000),
    };
}

async function fetchPosting(url: URL, research: DbResearch, result: SearchResult) {
  const html = await fetchHtml(url);
  return html ? postingFromHtml(html, research, result) : null;
}

async function searchWeb(query: string, recent = false) {
  if (query.length > 600 || query.trim().split(/\s+/).length > 75) {
    throw new Error("La requête de recherche dépasse les limites de Brave (600 caractères ou 75 mots).");
  }
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key)
    throw new Error(
      "La recherche web n’est pas configurée. Ajoutez BRAVE_SEARCH_API_KEY à l’environnement de PKida.",
    );
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("country", "FR");
  url.searchParams.set("search_lang", "fr");
  url.searchParams.set("count", "20");
  if (recent) url.searchParams.set("freshness", "pm");
  const response = await fetch(url, {
    headers: { Accept: "application/json", "X-Subscription-Token": key },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    const details = await response.json().catch(() => null) as { message?: unknown; error?: { message?: unknown; detail?: unknown } } | null;
    const explanation = typeof details?.message === "string"
      ? details.message
      : typeof details?.error?.message === "string"
        ? details.error.message
        : typeof details?.error?.detail === "string"
          ? details.error.detail
          : "";
    throw new Error(`Le fournisseur de recherche a répondu ${response.status}${explanation ? ` : ${explanation}` : "."}`);
  }
  const body = (await response.json()) as SearchResponse;
  return body.web?.results ?? [];
}

function searchTerms(research: DbResearch) {
  return [
    research.role,
    research.location,
    research.keywords,
    research.contract,
    research.remote,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()
    .split(/\s+/)
    .slice(0, 30)
    .join(" ")
    .slice(0, 250);
}

const ATS_HOSTS = [
  "greenhouse.io",
  "lever.co",
  "myworkdayjobs.com",
  "smartrecruiters.com",
  "ashbyhq.com",
  "recruitee.com",
  "comeet.com",
  "jobvite.com",
  "taleo.net",
];

function isExcludedCompanyHost(host: string) {
  return (
    matchesDomain(host, JOB_BOARD_DOMAINS) ||
    matchesDomain(host, SOCIAL_DOMAINS) ||
    matchesDomain(host, ATS_HOSTS)
  );
}

function getAnchors(html: string, baseUrl: URL) {
  const links: Array<{ url: URL; text: string }> = [];
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = match[1].match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (!href) continue;
    try {
      links.push({ url: new URL(href.replace(/&amp;/gi, "&"), baseUrl), text: plainText(match[2]) });
    } catch {
      // Skip malformed links from employer sites.
    }
  }
  return links;
}

function companySearchTokens(research: DbResearch) {
  const roleAndLocation = `${research.role} ${research.location}`
    .toLocaleLowerCase("fr")
    .split(/[\s,;|/]+/)
    .map((term) => term.replace(/[^\p{L}\p{N}-]/gu, ""))
    .filter((term) => term.length > 2);
  const companyKeywords = keywordTerms(research.keywords)
    .map((term) => term.toLocaleLowerCase("fr"))
    .filter((term) => term.replace(/[^\p{L}\p{N}]/gu, "").length > 2);
  return [...new Set([...roleAndLocation, ...companyKeywords])];
}

async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  mapper: (item: T) => Promise<R>,
) {
  const results: R[] = [];
  for (let offset = 0; offset < items.length; offset += batchSize) {
    results.push(
      ...(await Promise.all(
        items.slice(offset, offset + batchSize).map(mapper),
      )),
    );
  }
  return results;
}

async function findMatchingCompanies(db: ReturnType<typeof getDatabase>, research: DbResearch) {
  const terms = companySearchTokens(research);
  if (!terms.length) return [];
  const where = {
    OR: terms.flatMap((term) => [
      { name: { contains: term, mode: "insensitive" as const } },
      { description: { contains: term, mode: "insensitive" as const } },
      { sector: { contains: term, mode: "insensitive" as const } },
      { industry: { contains: term, mode: "insensitive" as const } },
      { location: { contains: term, mode: "insensitive" as const } },
    ]),
  };
  const companies = await db.company.findMany({ where });
  const criteria = companySearchTokens(research);
  return companies.map((company) => {
    const fields = `${company.name} ${company.description} ${company.sector} ${company.industry} ${company.location}`.toLocaleLowerCase("fr");
    const relevance = criteria.reduce((score, term) => score + (fields.includes(term) ? 1 : 0), 0);
    return { company, relevance };
  }).filter(({ relevance }) => relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || Number(Boolean(b.company.domain)) - Number(Boolean(a.company.domain)))
    .slice(0, 12)
    .map(({ company }) => company);
}

async function companyWebsiteCandidates(company: DbCompany) {
  const knownWebsite = company.website ?? (company.domain ? `https://${company.domain}` : null);
  if (knownWebsite) {
    const cleaned = cleanUrl(knownWebsite);
    return cleaned && !isExcludedCompanyHost(new URL(cleaned).hostname) ? [new URL(cleaned)] : [];
  }
  const companyName = company.name.trim().split(/\s+/).slice(0, 20).join(" ").slice(0, 250);
  const results = await searchWeb(`"${companyName}" site officiel`);
  const websites = new Map<string, URL>();
  for (const result of results) {
    const cleaned = result.url ? cleanUrl(result.url) : null;
    if (!cleaned) continue;
    const candidate = new URL(cleaned);
    if (candidate.protocol !== "https:" || isExcludedCompanyHost(candidate.hostname)) continue;
    websites.set(candidate.origin, new URL(candidate.origin));
    if (websites.size >= 1) break;
  }
  return [...websites.values()];
}

async function crawlCompanyOffers(company: DbCompany, research: DbResearch, websites?: URL[]) {
  const discovered: Array<{ result: SearchResult; url: URL; sourceType: "CAREER_SITE"; posting: PostingMetadata; companyRecord: DbCompany }> = [];
  const companyWebsites = websites ?? await companyWebsiteCandidates(company);
  for (const website of companyWebsites) {
    const rootHtml = await fetchHtml(website);
    if (!rootHtml) continue;
    const domain = registrableDomain(website.hostname);
    const sameCompany = (url: URL) => url.protocol === "https:" && registrableDomain(url.hostname) === domain && !isExcludedCompanyHost(url.hostname);
    const homepageLinks = getAnchors(rootHtml, website);
    const careerPages = new Map<string, { url: URL; text: string }>();
    for (const link of homepageLinks) {
      if (sameCompany(link.url) && CAREER_PATH.test(`${link.url.pathname} ${link.text}`)) careerPages.set(link.url.href, link);
    }
    for (const path of ["/careers", "/careers/", "/jobs", "/jobs/", "/recrutement", "/nous-rejoindre"]) {
      const url = new URL(path, website);
      careerPages.set(url.href, { url, text: "Offres d’emploi" });
    }
    const jobPages = new Map<string, { url: URL; text: string }>();
    for (const link of homepageLinks) {
      if (sameCompany(link.url) && /(?:job|emploi|offre|position|vacanc|poste|recrut)/i.test(`${link.url.pathname} ${link.text}`)) jobPages.set(link.url.href, link);
    }
    const visitedCareerPages = await Promise.all([...careerPages.values()].slice(0, 4).map(async (careerPage) => ({ careerPage, html: await fetchHtml(careerPage.url) })));
    for (const { careerPage, html } of visitedCareerPages) {
      if (!html) continue;
      const structured = extractPosting(html);
      if (structured) {
        discovered.push({ result: { title: structured.title ?? careerPage.text, url: careerPage.url.href, description: structured.description ?? "" }, url: careerPage.url, sourceType: "CAREER_SITE", posting: { ...structured, companyName: structured.companyName ?? company.name }, companyRecord: company });
      }
      for (const link of getAnchors(html, careerPage.url)) {
        if (sameCompany(link.url) && /(?:job|emploi|offre|position|vacanc|poste|recrut)/i.test(`${link.url.pathname} ${link.text}`)) jobPages.set(link.url.href, link);
      }
    }
    const verifiedPages = await Promise.all([...jobPages.values()].slice(0, 8).map(async (jobPage) => ({ jobPage, posting: await fetchPosting(jobPage.url, research, { title: jobPage.text, url: jobPage.url.href }) })));
    for (const { jobPage, posting } of verifiedPages) {
      if (!posting) continue;
      const result = { title: posting.title ?? jobPage.text ?? company.name, url: jobPage.url.href, description: posting.description ?? "" };
      discovered.push({ result, url: jobPage.url, sourceType: "CAREER_SITE", posting: { ...posting, companyName: posting.companyName ?? company.name }, companyRecord: company });
    }
  }
  return discovered;
}

export async function runResearch(researchId: string, userId?: string) {
  const db = getDatabase();
  const research = await db.research.findFirst({
    where: { id: researchId, ...(userId ? { userId } : {}) },
  });
  if (!research) return null;
  const run = await db.searchRun.create({ data: { researchId } });
  try {
    const terms = searchTerms(research);
    const socialResults = await searchWeb(
      `${terms} (site:linkedin.com/posts OR site:linkedin.com/feed/update)`,
      true,
    );
    const socials = new Map<
      string,
      { result: SearchResult; url: URL; sourceType: "SOCIAL_NETWORK" }
    >();
    for (const result of socialResults) {
      const cleaned = result.url ? cleanUrl(result.url) : null;
      if (!cleaned || !result.title) continue;
      const url = new URL(cleaned);
      if (classifySocialSource(url) === "SOCIAL_NETWORK")
        socials.set(cleaned, {
          result: { ...result, url: cleaned },
          url,
          sourceType: "SOCIAL_NETWORK",
        });
    }
    const matchedCompanies = await findMatchingCompanies(db, research);
    const companiesToScan = matchedCompanies;
    const companiesWithoutSites = companiesToScan.filter((company) => !company.website && !company.domain).slice(0, 4);
    const fallbackSites = new Map(await Promise.all(companiesWithoutSites.map(async (company) => [
      company.id,
      await companyWebsiteCandidates(company).catch(() => []),
    ] as const)));
    const careerBatches = await mapInBatches(companiesToScan, 4, (company) =>
      crawlCompanyOffers(
        company,
        research,
        company.website || company.domain
          ? undefined
          : fallbackSites.get(company.id) ?? [],
      ),
    );
    const careers = careerBatches.flat();
    const candidates = [
      ...careers,
      ...[...socials.values()].map((entry) => ({
        ...entry,
        posting: undefined,
        companyRecord: undefined,
      })),
    ]
      .map((entry) => ({
        ...entry,
        fullResult: entry.result,
        match: scoreOffer(research, entry.result),
      }))
      .sort((left, right) => right.match.score - left.match.score);
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    let notifiedToday = await db.researchMatch.count({
      where: { researchId, notifiedAt: { gte: dayStart } },
    });
    let storedCount = 0;
    for (const candidate of candidates) {
      const {
        result,
        url: parsedUrl,
        sourceType,
        posting,
        fullResult,
        companyRecord,
      } = candidate;
      const listingUrl = result.url!;
      const match = candidate.match;
      const exclusion = research.exclusions
        .split(/[,;\n]/)
        .map((word) => word.trim().toLocaleLowerCase("fr"))
        .filter(Boolean);
      const combinedText =
        `${fullResult.title} ${fullResult.description}`.toLocaleLowerCase("fr");
      const looksLikeJob =
        sourceType === "CAREER_SITE"
          ? /emploi|offre|job|career|carri[eè]re|recrut|hiring|position|vacanc/i.test(
              `${fullResult.title} ${listingUrl}`,
            )
          : /emploi|offre|job|career|carri[eè]re|recrut|hiring|position|poste\s+(?:à|a)\s+pourvoir/i.test(
              combinedText,
            );
      if (
        !match.relevant ||
        !looksLikeJob ||
        exclusion.some((word) => combinedText.includes(word))
      )
        continue;
      if (sourceType === "SOCIAL_NETWORK" && result.page_age) {
        const pageAge = dateField(result.page_age);
        if (
          pageAge &&
          Date.now() - pageAge.getTime() > 31 * 24 * 60 * 60 * 1000
        )
          continue;
      }
      const domain = registrableDomain(parsedUrl.hostname);
      const companyName =
        posting?.companyName ??
        companyNameFromTitle(
          fullResult.title!,
          parsedUrl.hostname,
          result.profile?.long_name ?? result.profile?.name,
        );
      if (!companyName) continue;
      const sourceName =
        sourceType === "SOCIAL_NETWORK"
          ? "LinkedIn"
          : `Site carrière · ${companyName}`;
      const companyData = {
        name: companyName,
        website:
          posting?.companyWebsite ??
          (sourceType === "CAREER_SITE"
            ? `${parsedUrl.protocol}//${domain}`
            : undefined),
        description: posting?.companyDescription ?? "",
        industry: posting?.companyIndustry ?? "",
      };
      const company = companyRecord
        ? await db.company.update({
            where: { id: companyRecord.id },
            data: {
              domain: companyRecord.domain ?? domain,
              website: companyRecord.website ?? companyData.website,
              description: companyData.description || undefined,
              sector: companyData.industry || undefined,
              industry: companyData.industry || undefined,
            },
          })
        : ((await db.company.findFirst({
              where: {
                name: { equals: companyName, mode: "insensitive" },
                domain: null,
              },
            })) ?? (await db.company.create({ data: { ...companyData } })));
      const offer = await db.jobOffer.upsert({
        where: { canonicalUrl: listingUrl },
        create: {
          canonicalUrl: listingUrl,
          title: fullResult.title!.slice(0, 500),
          description: (fullResult.description ?? "").slice(0, 12000),
          companyId: company.id,
          location: posting?.location ?? "",
          employmentType: posting?.employmentType ?? "",
          workplaceType: posting?.workplaceType ?? "",
          salaryMin: posting?.salaryMin,
          salaryMax: posting?.salaryMax,
          salaryCurrency: posting?.salaryCurrency,
          postedAt: posting?.datePosted ?? dateField(result.page_age),
          expiresAt: posting?.validThrough,
          rawMetadata: {
            discoveryMethod: sourceType === "SOCIAL_NETWORK" ? "Brave Search" : "Company website crawl",
            resultDescription: result.description ?? "",
            pageAge: result.page_age ?? null,
            structuredPosting: posting
              ? {
                  ...posting,
                  datePosted: posting.datePosted?.toISOString() ?? null,
                  validThrough: posting.validThrough?.toISOString() ?? null,
                }
              : null,
            socialProfile: result.profile ?? null,
          },
        },
        update: {
          title: fullResult.title!.slice(0, 500),
          description: fullResult.description?.slice(0, 12000) ?? undefined,
          companyId: company.id,
          location: posting?.location ?? undefined,
          employmentType: posting?.employmentType ?? undefined,
          workplaceType: posting?.workplaceType ?? undefined,
          salaryMin: posting?.salaryMin,
          salaryMax: posting?.salaryMax,
          salaryCurrency: posting?.salaryCurrency,
          postedAt: posting?.datePosted ?? dateField(result.page_age),
          expiresAt: posting?.validThrough,
          lastSeenAt: new Date(),
          status: "ACTIVE",
        },
      });
      await db.offerSource.upsert({
        where: { sourceUrl: listingUrl },
        create: {
          offerId: offer.id,
          type: sourceType,
          name: sourceName,
          sourceUrl: listingUrl,
          metadata: {
            discoveryMethod: sourceType === "SOCIAL_NETWORK" ? "Brave Search" : "Company website crawl",
            publiclyIndexed: sourceType === "SOCIAL_NETWORK",
            accountOwnershipVerified: false,
          },
        },
        update: {
          lastSeenAt: new Date(),
          offerId: offer.id,
          type: sourceType,
          name: sourceName,
        },
      });
      const existingMatch = await db.researchMatch.findUnique({
        where: { researchId_offerId: { researchId, offerId: offer.id } },
        select: { id: true, notifiedAt: true },
      });
      const shouldNotify =
        !existingMatch?.notifiedAt && notifiedToday < research.pace;
      await db.researchMatch.upsert({
        where: { researchId_offerId: { researchId, offerId: offer.id } },
        create: {
          researchId,
          offerId: offer.id,
          score: match.score,
          matchReasons: match.reasons,
          notifiedAt: shouldNotify ? new Date() : null,
        },
        update: {
          score: match.score,
          matchReasons: match.reasons,
          ...(shouldNotify ? { notifiedAt: new Date() } : {}),
        },
      });
      if (shouldNotify) notifiedToday++;
      storedCount++;
    }
    const now = new Date();
    await db.$transaction([
      db.searchRun.update({
        where: { id: run.id },
        data: {
          status: "SUCCEEDED",
          completedAt: now,
          resultCount: storedCount,
        },
      }),
      db.research.update({
        where: { id: researchId },
        data: {
          status: "ACTIVE",
          lastRunAt: now,
          nextRunAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          lastError: null,
        },
      }),
    ]);
    return { runId: run.id, resultCount: storedCount };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "La recherche a échoué.";
    await db.$transaction([
      db.searchRun.update({
        where: { id: run.id },
        data: { status: "FAILED", completedAt: new Date(), error: message },
      }),
      db.research.update({
        where: { id: researchId },
        data: { lastRunAt: new Date(), lastError: message },
      }),
    ]);
    throw error;
  }
}
