import { config } from "dotenv";
import puppeteer from "puppeteer";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.ts";

importCompanyEnv();

function importCompanyEnv() {
  config({ path: ".env.local", quiet: true });
  config({ path: ".env", quiet: true });
}

if (process.argv.includes("--help")) {
  console.log(`Usage: npm run db:enrich-company-domains -- [--limit=N]

Searches DuckDuckGo HTML with Puppeteer, checks each likely official website
against the company name and existing description/sector/location, and fills
website/domain only when a candidate is sufficiently convincing.

Options:
  --limit=N                    Companies per run (default: 50)
  COMPANY_DOMAIN_DELAY_MS      Delay between companies (default: 1500)
  COMPANY_DOMAIN_MIN_SCORE     Minimum identity score (default: 5)`);
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL est nécessaire pour compléter les domaines.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3 }),
});
const argValue = (name) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1];
const limit = Math.max(1, Number(argValue("limit") ?? 50) || 50);
const delayMs = Math.max(250, Number(process.env.COMPANY_DOMAIN_DELAY_MS ?? 1500));
const minScore = Math.max(1, Number(process.env.COMPANY_DOMAIN_MIN_SCORE ?? 5));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const tokens = (value) =>
  normalize(value)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
const STOP_WORDS = new Set([
  "les", "des", "the", "and", "company", "entreprise", "groupe", "group",
  "societe", "services", "service", "france", "international", "holding",
]);
const excludedHosts = [
  /(^|\.)google\./i, /(^|\.)bing\.com$/i, /(^|\.)duckduckgo\.com$/i,
  /(^|\.)linkedin\.com$/i, /(^|\.)facebook\.com$/i, /(^|\.)instagram\.com$/i,
  /(^|\.)x\.com$/i, /(^|\.)wikipedia\.org$/i, /(^|\.)societe\.com$/i,
  /(^|\.)pappers\.fr$/i, /(^|\.)annuaire-entreprises\.data\.gouv\.fr$/i,
  /(^|\.)sortlist\.(fr|com)$/i, /(^|\.)numeum\.fr$/i,
  /(^|\.)glassdoor\./i, /(^|\.)indeed\./i, /(^|\.)jobijoba\./i,
  /(^|\.)hellowork\./i, /(^|\.)francetravail\.fr$/i,
];

function scoreIdentity(name, evidence) {
  const companyTokens = tokens(name);
  const haystack = normalize(evidence);
  const found = companyTokens.filter((token) => haystack.includes(token));
  const companyCoverage = found.length / Math.max(companyTokens.length, 1);
  let score = found.length * 2;
  if (companyCoverage >= 0.75) score += 3;
  else if (companyCoverage >= 0.5) score += 1;
  return score;
}

function safeResultUrl(raw) {
  try {
    const url = new URL(raw);
    if (!/^https?:$/.test(url.protocol)) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (excludedHosts.some((pattern) => pattern.test(host))) return null;
    if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(host)) return null;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function decodeDdGRedirect(value) {
  try {
    const parsed = new URL(value);
    const redirected = parsed.searchParams.get("uddg");
    return redirected ? decodeURIComponent(redirected) : value;
  } catch {
    return value;
  }
}

async function discoverCandidates(page, company) {
  const query = `${company.name} ${company.location ?? ""} ${company.sector ?? ""} site officiel`;
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  return page.evaluate(() =>
    [...document.querySelectorAll(".result")].slice(0, 8).map((result) => ({
      href: result.querySelector("a.result__a")?.href ?? "",
      title: result.querySelector("a.result__a")?.innerText?.trim() ?? "",
      snippet: result.querySelector(".result__snippet")?.innerText?.trim() ?? "",
    })),
  );
}

async function inspectWebsite(page, candidateUrl) {
  await page.goto(candidateUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
  return page.evaluate(() => {
    const meta = (selector) => document.querySelector(selector)?.content?.trim() ?? "";
    const jsonld = [];
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const parsed = JSON.parse(script.textContent ?? "null");
        const collect = (item) => {
          if (Array.isArray(item)) return item.forEach(collect);
          if (!item || typeof item !== "object") return;
          if (item["@graph"]) collect(item["@graph"]);
          if (/organization|localbusiness/i.test(JSON.stringify(item["@type"] ?? ""))) jsonld.push(item);
        };
        collect(parsed);
      } catch {}
    }
    const organization = jsonld.find((item) => item.name || item.url) ?? {};
    return {
      title: document.title ?? "",
      description: meta('meta[name="description"]') || meta('meta[property="og:description"]'),
      siteName: meta('meta[property="og:site_name"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? "",
      organizationName: organization.name ?? "",
      organizationUrl: organization.url ?? "",
      text: (document.body?.innerText ?? "").slice(0, 10000),
    };
  });
}

const counts = { checked: 0, enriched: 0, uncertain: 0, errors: 0 };
let browser;
try {
  const companies = await prisma.company.findMany({
    where: { OR: [{ domain: null }, { website: null }, { website: "" }] },
    orderBy: { updatedAt: "asc" },
    take: limit,
  });
  browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (compatible; PKidaCompanyCatalog/1.0)");
  for (const company of companies) {
    counts.checked++;
    try {
      const results = await discoverCandidates(page, company);
      const candidates = [...new Map(results.map((result) => {
        const href = safeResultUrl(decodeDdGRedirect(result.href));
        return [href, href ? { ...result, href } : null];
      }).filter(([href]) => href)).values()];
      let best = null;
      for (const candidate of candidates.slice(0, 5)) {
        try {
          const details = await inspectWebsite(page, candidate.href);
          const canonical = safeResultUrl(details.canonical || details.organizationUrl || candidate.href);
          if (!canonical) continue;
          const identity = `${candidate.title} ${candidate.snippet} ${details.organizationName} ${details.siteName} ${details.title}`;
          const identityScore = scoreIdentity(company.name, identity);
          const companyContext = `${company.description} ${company.sector} ${company.industry} ${company.location}`;
          const contextTokens = tokens(companyContext).slice(0, 25);
          const pageEvidence = normalize(`${details.description} ${details.text}`);
          const contextHits = contextTokens.filter((token) => pageEvidence.includes(token)).length;
          const score = identityScore + Math.min(contextHits, 3);
          if (!best || score > best.score) best = { canonical, details, candidate, score, identityScore };
        } catch {
          // Search results can lead to blocked or unavailable sites.
        }
      }
      if (!best || best.score < minScore || best.identityScore < 3) {
        counts.uncertain++;
        console.log(`À vérifier manuellement : ${company.name}`);
      } else {
        const url = new URL(best.canonical);
        const website = `${url.protocol}//${url.host}`;
        const domain = url.hostname.replace(/^www\./, "").toLowerCase();
        const collision = await prisma.company.findUnique({ where: { domain } });
        if (collision && collision.id !== company.id) {
          counts.uncertain++;
          console.log(`Domaine déjà attribué, laissé intact : ${company.name} → ${domain}`);
        } else {
          const oldMetadata = company.metadata && typeof company.metadata === "object" && !Array.isArray(company.metadata)
            ? company.metadata
            : {};
          const sources = Array.isArray(oldMetadata.sources) ? oldMetadata.sources : [];
          await prisma.company.update({
            where: { id: company.id },
            data: {
              website: company.website || website,
              domain: company.domain || domain,
              description: company.description || best.details.description,
              metadata: {
                ...oldMetadata,
                sources: [...sources, {
                  source: "duckduckgo-puppeteer",
                  sourceUrl: best.candidate.href,
                  identityScore: best.identityScore,
                  verifiedAt: new Date().toISOString(),
                }],
              },
            },
          });
          counts.enriched++;
          console.log(`Domaine trouvé : ${company.name} → ${domain} (score ${best.score})`);
        }
      }
    } catch (error) {
      counts.errors++;
      console.warn(`Recherche ignorée (${company.name}) : ${error.message}`);
    }
    await wait(delayMs);
  }
  console.log(`Terminé — ${counts.checked} vérifiées, ${counts.enriched} complétées, ${counts.uncertain} incertaines, ${counts.errors} erreurs.`);
} catch (error) {
  console.error(`Enrichissement interrompu : ${error.message}`);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await prisma.$disconnect();
}
