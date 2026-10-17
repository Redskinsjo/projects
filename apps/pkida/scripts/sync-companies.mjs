import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.ts";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

if (process.argv.includes("--help")) {
  console.log(`Usage: npm run db:sync-companies -- [--source=all|annuaire|numeum|sortlist] [--pages=N|all]

Environment:
  ANNUAIRE_SEARCH_TERMS          Comma-separated public API search terms
  ANNUAIRE_MAX_PAGES             Pages per search term (default: 3)
  SORTLIST_MAX_CATEGORIES        Sortlist categories per run (default: 20)
  NUMEUM_MAX_COMPANIES_PER_RUN   Numeum profiles per run (default: 100)
  COMPANY_SCRAPER_MAX_DETAILS    Maximum directory profile pages (default: 500)
  COMPANY_SCRAPER_DELAY_MS       Delay between profile fetches (default: 500)

Requires Node.js 22.6+ for native TypeScript support in the generated Prisma client.`);
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL est nécessaire pour importer les entreprises.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 4 }),
});
const stateUrl = new URL("../.data/company-sync-state.json", import.meta.url);
let state = {};
try {
  state = JSON.parse(await readFile(stateUrl, "utf8"));
} catch {
  // First run or an absent state file starts each source at its first page.
}
async function saveState() {
  await mkdir(dirname(fileURLToPath(stateUrl)), { recursive: true });
  await writeFile(stateUrl, JSON.stringify(state, null, 2));
}
const userAgent = "PKidaCompanyCatalog/1.0 (company metadata importer)";
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const crawlDelay = getPageLimit(process.env.COMPANY_SCRAPER_DELAY_MS, 500);
const decode = (value) =>
  value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) =>
      String.fromCodePoint(parseInt(number, 16)),
    );
const plainText = (html) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " "),
  ).trim();

async function get(url, { json = false } = {}) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: json ? "application/json" : "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return json ? response.json() : response.text();
}

function normalizeWebsite(value) {
  if (!value || typeof value !== "string") return null;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function domainOf(value) {
  const website = normalizeWebsite(value);
  return website
    ? new URL(website).hostname.replace(/^www\./, "").toLowerCase()
    : null;
}

function anchors(html, baseUrl) {
  const result = [];
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = match[1].match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (!href) continue;
    try {
      result.push({
        url: new URL(decode(href), baseUrl),
        text: plainText(match[2]),
      });
    } catch {
      // Ignore malformed links.
    }
  }
  return result;
}

function metaContent(html, key, attribute = "name") {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(
    new RegExp(
      `<meta[^>]+${attribute}=["']${escaped}["'][^>]+content=["']([^"']*)["']`,
      "i",
    ),
  );
  return match ? plainText(match[1]) : "";
}

function extractOrganizationJsonLd(html) {
  for (const match of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const parsed = JSON.parse(match[1]);
      const objects = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of objects) {
        if (
          item &&
          typeof item === "object" &&
          /organization|localbusiness/i.test(
            JSON.stringify(item["@type"] ?? ""),
          )
        )
          return item;
      }
    } catch {
      // Ignore malformed structured data.
    }
  }
  return null;
}

async function saveCompany(input) {
  const name = String(input.name ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!name) return false;
  const website = normalizeWebsite(input.website);
  const domain = domainOf(website);
  const siren = input.sourceMetadata?.siren;
  const existingByDomain = domain
    ? await prisma.company.findUnique({ where: { domain } })
    : null;
  const existingBySiren = !existingByDomain && siren
      ? await prisma.company.findFirst({
          where: { metadata: { path: ["siren"], equals: siren } },
        })
      : null;
  const existingByName = !existingByDomain && !existingBySiren
    ? await prisma.company.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      })
    : null;
  const existing = existingByDomain ?? existingBySiren ?? existingByName;
  const oldMetadata =
    existing?.metadata &&
    typeof existing.metadata === "object" &&
    !Array.isArray(existing.metadata)
      ? existing.metadata
      : {};
  const oldSources = Array.isArray(oldMetadata.sources)
    ? oldMetadata.sources
    : [];
  const nextSource = {
    source: input.source,
    sourceUrl: input.sourceUrl ?? null,
    importedAt: new Date().toISOString(),
    ...input.sourceMetadata,
  };
  const sources = [
    ...oldSources.filter(
      (source) =>
        source?.source !== input.source ||
        source?.sourceUrl !== nextSource.sourceUrl,
    ),
    nextSource,
  ];
  const onlyMissing = input.onlyMissing === true;
  const choose = (incoming, old) =>
    onlyMissing ? old || incoming || "" : incoming || old || "";
  const data = {
    name: onlyMissing ? existing?.name || name : name,
    website: choose(website, existing?.website) || null,
    domain: choose(domain, existing?.domain) || null,
    description: choose(input.description, existing?.description),
    sector: choose(input.sector, existing?.sector),
    industry: choose(input.industry, existing?.industry),
    location: choose(input.location, existing?.location),
    metadata: { ...oldMetadata, ...(siren ? { siren } : {}), sources },
  };
  if (existing)
    await prisma.company.update({ where: { id: existing.id }, data });
  else await prisma.company.create({ data });
  return !existing;
}

const sourceCounts = { created: 0, updated: 0, errors: 0 };
async function persist(input) {
  try {
    const created = await saveCompany(input);
    sourceCounts[created ? "created" : "updated"]++;
  } catch (error) {
    sourceCounts.errors++;
    console.warn(
      `Import ignoré (${input.name ?? "nom inconnu"}) : ${error.message}`,
    );
  }
}

const annuaireTerms = (
  process.env.ANNUAIRE_SEARCH_TERMS ??
  "informatique,conseil,industrie,santé,finance,commerce,construction,transport,énergie,communication,services numériques"
)
  .split(",")
  .map((term) => term.trim())
  .filter(Boolean);

async function importAnnuaire(maxPages) {
  const base = "https://recherche-entreprises.api.gouv.fr/search";
  for (const term of annuaireTerms) {
    const startPage = state.annuairePages?.[term] ?? 1;
    for (let offset = 0; offset < maxPages; offset++) {
      const page = startPage + offset;
      const url = new URL(base);
      url.searchParams.set("q", term);
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", "25");
      const body = await get(url, { json: true });
      const results = body.results ?? [];
      for (const company of results) {
        const headquarters = company.siege ?? {};
        await persist({
          source: "annuaire-entreprises.data.gouv.fr",
          sourceUrl: `https://annuaire-entreprises.data.gouv.fr/entreprise/${company.siren ?? ""}`,
          name:
            company.nom_complet ??
            company.nom_raison_sociale ??
            company.denomination,
          description:
            company.libelle_activite_principale ??
            company.activite_principale ??
            "",
          sector: company.libelle_activite_principale ?? "",
          industry: company.activite_principale ?? "",
          location: [headquarters.libelle_commune, headquarters.code_postal]
            .filter(Boolean)
            .join(", "),
          sourceMetadata: {
            siren: company.siren ?? null,
            naf: company.activite_principale ?? null,
            trancheEffectif: company.tranche_effectif_salarie ?? null,
          },
        });
      }
      const totalPages = Number(body.total_pages ?? 0);
      if (results.length < 25 || (totalPages && page >= totalPages)) {
        state.annuairePages = { ...state.annuairePages, [term]: 1 };
        await saveState();
        break;
      }
      state.annuairePages = { ...state.annuairePages, [term]: page + 1 };
      await saveState();
      await pause(200);
    }
    console.log(`Annuaire officiel : requête « ${term} » importée.`);
  }
}

function getPageLimit(argument, fallback) {
  if (argument === "all") return Number.MAX_SAFE_INTEGER;
  const number = Number(argument ?? fallback);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

async function importNumeum(maxPages, detailLimit) {
  const base = "https://numeum.fr";
  let importedProfiles = 0;
  const startPage = state.numeumNextPage ?? 1;
  const startProfileOffset = state.numeumProfileOffset ?? 0;
  for (let offset = 0; offset < maxPages; offset++) {
    if (importedProfiles >= detailLimit) break;
    const page = startPage + offset;
    const listingUrl =
      page === 1
        ? `${base}/la-communaute/annuaire-des-adherents/`
        : `${base}/la-communaute/annuaire-des-adherents/page/${page}/`;
    const html = await get(listingUrl);
    const profiles = anchors(html, listingUrl).filter(({ url }) =>
      /\/annuaire-des-adherents\/[^/]+\/$/.test(url.pathname),
    );
    const unique = new Map(
      profiles.map((profile) => [profile.url.href, profile]),
    );
    if (!unique.size) {
      state.numeumNextPage = 1;
      await saveState();
      break;
    }
    const profilesOnPage = [...unique.values()];
    for (let profileOffset = page === startPage ? startProfileOffset : 0; profileOffset < profilesOnPage.length; profileOffset++) {
      if (importedProfiles >= detailLimit) {
        state.numeumNextPage = page;
        state.numeumProfileOffset = profileOffset;
        await saveState();
        console.log(`Numeum : plafond de ${detailLimit} fiches atteint, reprise à la fiche ${profileOffset + 1} de la page ${page}.`);
        return;
      }
      const profile = profilesOnPage[profileOffset];
      try {
        const detail = await get(profile.url);
        const title = plainText(
          detail.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? profile.text,
        );
        const bodyText = plainText(detail);
        const sector =
          bodyText.match(
            /(?:Services du numérique \(ESN\)|Éditeur de logiciels \(EDL\)|Plateforme|Conseil|Opérateur|Fabricant)/i,
          )?.[0] ?? "";
        const location =
          bodyText.match(/Région\s+([^|.]+?)(?:\s+Voir|$)/i)?.[1]?.trim() ?? "";
        const external = anchors(detail, profile.url).find(
          ({ url, text }) =>
            url.hostname !== "numeum.fr" &&
            url.protocol === "https:" &&
            /site web|visiter|website/i.test(text),
        );
        await persist({
          source: "Numeum",
          sourceUrl: profile.url.href,
          name: title,
          website: external?.url.href,
          sector,
          industry: sector,
          location,
          description: metaContent(detail, "description"),
        });
        importedProfiles++;
      } catch (error) {
        sourceCounts.errors++;
        console.warn(
          `Fiche Numeum ignorée (${profile.url.pathname}) : ${error.message}`,
        );
      }
      await pause(crawlDelay);
    }
    state.numeumNextPage = page + 1;
    state.numeumProfileOffset = 0;
    await saveState();
    console.log(`Numeum : page ${page}, ${importedProfiles} fiches traitées.`);
  }
}

async function importSortlist(maxCategories, detailLimit) {
  const { default: puppeteer } = await import("puppeteer");
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
  } catch (error) {
    if (/Could not find Chrome|Could not find browser/i.test(error.message)) {
      throw new Error(
        `Chrome pour Puppeteer est absent. Lancez « npm run db:install-browser », puis relancez le scraping. ${error.message}`,
      );
    }
    throw error;
  }
  const page = await browser.newPage();
  const getSortlistPage = async (url) => {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    if (!response?.ok()) {
      throw new Error(`${response?.status() ?? "aucune réponse"} ${url}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 900));
    return page.content();
  };
  try {
  const root = "https://www.sortlist.fr/explore";
  let allCategories = [];
  try {
    const explore = await getSortlistPage(root);
    allCategories = [
      ...new Map(
        anchors(explore, root)
          .filter(
            ({ url }) =>
              url.hostname === "www.sortlist.fr" &&
              /^\/(?:s\/|l\/|pub\/|graphisme\/|developpement-web\/).+\/france-fr\/?$/.test(url.pathname),
          )
          .map(({ url, text }) => [url.href, { url, text }]),
      ).values(),
    ];
  } catch (error) {
    if (!/403/.test(error.message)) throw error;
    const fallbackPaths = [
      ["Conseil", "/s/conseil/france-fr"],
      ["Communication", "/s/communication/france-fr"],
      ["Marketing", "/l/france-fr"],
      ["Publicité", "/pub/france-fr"],
      ["Développement web", "/developpement-web/france-fr"],
      ["Graphisme", "/graphisme/france-fr"],
      ["Design créatif", "/s/design-creatif/france-fr"],
      ["Design produit", "/s/design-produit/france-fr"],
      ["Stratégie marketing", "/s/strategie-marketing/france-fr"],
      ["Marketing B2B", "/s/marketing-b2b/france-fr"],
    ];
    allCategories = fallbackPaths.map(([text, path]) => ({
      text,
      url: new URL(path, root),
    }));
    console.warn(
      `Sortlist : /explore renvoie 403, parcours de ${allCategories.length} catégories publiques prédéfinies à la place.`,
    );
  }
  if (!allCategories.length) {
    throw new Error("Aucune catégorie Sortlist exploitable trouvée.");
  }
  const startCategory = state.sortlistNextCategory ?? 0;
  const categories = Array.from(
    { length: Math.min(maxCategories, allCategories.length) },
    (_, offset) =>
      allCategories[(startCategory + offset) % allCategories.length],
  );
  let importedProfiles = 0;
  for (
    let categoryOffset = 0;
    categoryOffset < categories.length;
    categoryOffset++
  ) {
    const category = categories[categoryOffset];
    if (importedProfiles >= detailLimit) break;
    const listing = await getSortlistPage(category.url);
    const profiles = [
      ...new Map(
        anchors(listing, category.url)
          .filter(
            ({ url }) =>
              url.hostname === "www.sortlist.fr" &&
              /\/agency\//i.test(url.pathname),
          )
          .map((profile) => [profile.url.href, profile]),
      ).values(),
    ];
    for (const profile of profiles) {
      if (importedProfiles >= detailLimit) break;
      try {
        const detail = await getSortlistPage(profile.url);
        const organization = extractOrganizationJsonLd(detail) ?? {};
        const title = plainText(
          detail.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? profile.text,
        );
        const description = String(
          organization.description ??
            metaContent(detail, "og:description", "property") ??
            metaContent(detail, "description"),
        );
        const externalLinks = anchors(detail, profile.url).filter(({ url }) => {
          const host = url.hostname.toLowerCase();
          return url.protocol === "https:" &&
            !/(^|\.)sortlist\.(fr|com)$/.test(host) &&
            !/(^|\.)(linkedin|facebook|instagram|twitter|x|youtube|tiktok|pinterest|wa\.me|linktr\.ee)\.(com|fr|be|net|org)$/.test(host);
        });
        const external = externalLinks.find(({ text }) => /site web|website|visiter|visit/i.test(text)) ?? externalLinks[0];
        const structuredWebsite = normalizeWebsite(organization.url);
        const structuredHost = structuredWebsite ? new URL(structuredWebsite).hostname : "";
        const website = structuredWebsite && !/(^|\.)sortlist\.(fr|com)$/.test(structuredHost)
          ? structuredWebsite
          : external?.url.href;
        const location = String(organization.address?.addressLocality ?? "");
        await persist({
          source: "Sortlist",
          sourceUrl: profile.url.href,
          name: organization.name ?? title,
          website,
          description,
          sector: category.text,
          industry: category.text,
          location,
          onlyMissing: true,
        });
        importedProfiles++;
      } catch (error) {
        if (/403/.test(error.message)) {
          const cardText = profile.text.replace(/\s+/g, " ").trim();
          const name = cardText.split(/\s+(?=\d(?:[.,]\d)?\s*\()/)[0]?.trim();
          const location =
            cardText.match(
              /(?:Situé à|Située à|Basé à|Basée à)\s+(.+?)(?=\s+(?:À partir|De \d|Budget|Parle)\b|$)/i,
            )?.[1] ?? "";
          if (name) {
            await persist({
              source: "Sortlist",
              sourceUrl: profile.url.href,
              name,
              description: cardText,
              sector: category.text,
              industry: category.text,
              location,
              onlyMissing: true,
              sourceMetadata: { profileAccess: "forbidden", category: category.text },
            });
            importedProfiles++;
            console.warn(
              `Profil Sortlist bloqué par 403, fiche résumée depuis la catégorie : ${name}`,
            );
          } else {
            sourceCounts.errors++;
            console.warn(
              `Fiche Sortlist inaccessible (${profile.url.pathname}) : ${error.message}`,
            );
          }
        } else {
          sourceCounts.errors++;
          console.warn(
            `Fiche Sortlist ignorée (${profile.url.pathname}) : ${error.message}`,
          );
        }
      }
      await pause(crawlDelay);
    }
    state.sortlistNextCategory =
      (startCategory + categoryOffset + 1) % allCategories.length;
    await saveState();
    console.log(
      `Sortlist : catégorie « ${category.text} », ${profiles.length} profils.`,
    );
  }
  } finally {
    await browser.close();
  }
}

const args = process.argv.slice(2);
const source =
  args.find((arg) => arg.startsWith("--source="))?.split("=")[1] ?? "all";
const pages = getPageLimit(
  args.find((arg) => arg.startsWith("--pages="))?.split("=")[1],
  20,
);
const categories = getPageLimit(process.env.SORTLIST_MAX_CATEGORIES, 20);
const details = getPageLimit(process.env.COMPANY_SCRAPER_MAX_DETAILS, 500);
const numeumLimit = getPageLimit(process.env.NUMEUM_MAX_COMPANIES_PER_RUN, 100);

try {
  const sources = [
    [
      "annuaire",
      () => importAnnuaire(getPageLimit(process.env.ANNUAIRE_MAX_PAGES, 3)),
    ],
    ["numeum", () => importNumeum(pages, numeumLimit)],
    ["sortlist", () => importSortlist(categories, details)],
  ];
  for (const [name, importSource] of sources) {
    if (source !== "all" && source !== name) continue;
    try {
      await importSource();
    } catch (error) {
      sourceCounts.errors++;
      console.error(`Source ${name} indisponible : ${error.message}`);
    }
  }
  console.log(
    `Terminé — ${sourceCounts.created} créées, ${sourceCounts.updated} mises à jour, ${sourceCounts.errors} erreurs.`,
  );
  if (sourceCounts.errors) process.exitCode = 1;
} catch (error) {
  console.error(`Import interrompu : ${error.message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
