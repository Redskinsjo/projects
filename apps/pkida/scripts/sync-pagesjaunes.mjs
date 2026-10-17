import { config } from "dotenv";
import puppeteer from "puppeteer";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.ts";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const help = process.argv.includes("--help");
if (help) {
  console.log(`Usage: npm run db:sync-pagesjaunes -- [--limit=N] [--start=N] [--all] [--reset-state] [--dry-run]

Interroge PagesJaunes avec les mots-clés configurés ci-dessous,
associés aux grandes villes et aux départements les plus peuplés. Les résultats
sont traités par lots et la progression est reprise dans .data/pagesjaunes-state.json.

Options:
  --limit=N       Recherches par exécution (défaut: 50)
  --start=N       Index de départ dans le produit cartésien (défaut: progression)
  --all           Traiter toutes les recherches restantes
  --reset-state   Repartir de la première combinaison
  --dry-run       Parcourir et compter sans modifier la base

Variables:
  PAGESJAUNES_DELAY_MS   Pause entre recherches (défaut: 2500)
  PAGESJAUNES_DETAIL_DELAY_MS Pause entre fiches d'entreprise (défaut: 1000)
  PAGESJAUNES_MAX_RESULTS Résultats par recherche (défaut: 25)`);
  process.exit(0);
}

const KEYWORDS = [
  "logiciel", "informatique", "IT", "numérique", "SaaS", "technologie", "industrie", "conseil",
  "services", "santé", "finance", "commerce", "énergie", "bâtiment", "logistique", "développement",
  "ingénierie", "conception", "production", "maintenance", "intégration", "déploiement",
  "accompagnement", "audit", "recrutement", "gestion de projet", "programmation", "cloud",
  "cybersécurité", "data", "intelligence artificielle", "automatisation", "comptabilité", "paie",
  "vente", "prospection", "marketing digital", "SEO", "PME", "TPE", "startup", "entreprise familiale",
  "équipe réduite", "polyvalence", "proximité", "autonomie", "croissance",
];

// Principales communes et départements par population.
// La liste peut être ajustée sans modifier le moteur de recherche.
const CITIES = [
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg",
  "Bordeaux", "Lille", "Rennes", "Reims", "Toulon", "Saint-Étienne", "Le Havre", "Grenoble",
  "Dijon", "Angers", "Villeurbanne", "Nîmes",
];
const DEPARTMENTS = [
  "Nord", "Paris", "Bouches-du-Rhône", "Rhône", "Hauts-de-Seine", "Seine-Saint-Denis", "Gironde",
  "Pas-de-Calais", "Yvelines", "Loire-Atlantique", "Haute-Garonne", "Val-de-Marne", "Seine-et-Marne",
  "Essonne", "Isère", "Alpes-Maritimes", "Val-d’Oise", "Seine-Maritime", "Hérault", "Bas-Rhin",
];
const LOCATIONS = [
  ...CITIES.map((name) => ({ name, type: "ville" })),
  ...DEPARTMENTS.map((name) => ({ name: `département ${name}`, type: "département" })),
];
const TERMS = [...new Set(KEYWORDS)];
const combinations = TERMS.flatMap((term) => LOCATIONS.map((location) => ({ term, location })));
const planVersion = "keywords-cities-departments-v1";
const getArg = (key) => process.argv.find((arg) => arg.startsWith(`--${key}=`))?.split("=")[1];
const requestedStart = getArg("start");
const limit = process.argv.includes("--all") ? combinations.length : Math.max(1, Number(getArg("limit") ?? 50) || 50);
const delayMs = Math.max(1500, Number(process.env.PAGESJAUNES_DELAY_MS ?? 2500));
const detailDelayMs = Math.max(750, Number(process.env.PAGESJAUNES_DETAIL_DELAY_MS ?? 1000));
const maxResults = Math.max(1, Number(process.env.PAGESJAUNES_MAX_RESULTS ?? 25));
const dryRun = process.argv.includes("--dry-run");
const stateUrl = new URL("../.data/pagesjaunes-state.json", import.meta.url);
let state = { planVersion, nextIndex: 0 };
if (!process.argv.includes("--reset-state")) {
  try {
    const savedState = JSON.parse(await readFile(stateUrl, "utf8"));
    if (savedState.planVersion === planVersion) state = { ...state, ...savedState };
  } catch { /* first run or old cursor */ }
}
const start = requestedStart === undefined ? state.nextIndex : Math.max(0, Number(requestedStart) || 0);
const end = Math.min(combinations.length, start + limit);
console.log(`${TERMS.length} termes × ${LOCATIONS.length} zones = ${combinations.length} recherches; lot ${start + 1}–${end}.`);
if (start >= combinations.length) {
  console.log("Toutes les combinaisons ont déjà été traitées. Utilisez --reset-state pour recommencer.");
  process.exit(0);
}
if (!dryRun && !process.env.DATABASE_URL) {
  console.error("DATABASE_URL est nécessaire pour enregistrer les entreprises.");
  process.exit(1);
}

const prisma = dryRun ? null : new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3 }),
});
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalizeWebsite = (value) => {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    if (!/^https?:$/.test(url.protocol)) return null;
    return `${url.protocol}//${url.host}`;
  } catch { return null; }
};
const domainOf = (website) => website ? new URL(website).hostname.replace(/^www\./i, "").toLowerCase() : null;
const normalizeName = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

async function saveCompany(record) {
  const name = normalizeName(record.name);
  if (!name || name.length > 180) return false;
  const website = normalizeWebsite(record.website);
  const domain = domainOf(website);
  const existing = (domain && await prisma.company.findUnique({ where: { domain } })) ??
    await prisma.company.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  const metadata = existing?.metadata && typeof existing.metadata === "object" && !Array.isArray(existing.metadata)
    ? existing.metadata : {};
  const oldSources = Array.isArray(metadata.sources) ? metadata.sources : [];
  const phones = [...new Set([...(record.phones ?? []), ...(record.phone ? [record.phone] : [])].map((value) => normalizeName(value)).filter(Boolean))];
  const sourceEntry = {
    source: "pagesjaunes",
    sourceUrl: record.sourceUrl,
    importedAt: new Date().toISOString(),
    searchTerm: record.searchTerm,
    searchedLocation: record.searchedLocation,
    listingUrl: record.sourceUrl,
    address: record.address || null,
    phones,
    activity: record.activity || null,
    description: record.description || null,
    keywords: record.keywords ?? [],
    openingHours: record.openingHours ?? [],
    website: record.website || null,
  };
  const sources = [...oldSources.filter((item) => item?.sourceUrl !== sourceEntry.sourceUrl), sourceEntry];
  const data = {
    name: existing?.name || name,
    website: existing?.website || website,
    domain: existing?.domain || domain,
    description: existing?.description || record.description || record.activity || "",
    sector: existing?.sector || record.searchTerm,
    industry: existing?.industry || record.activity || record.searchTerm,
    location: existing?.location || record.address || record.searchedLocation,
    metadata: {
      ...metadata,
      phones: [...new Set([...(Array.isArray(metadata.phones) ? metadata.phones : []), ...phones])],
      postalAddress: metadata.postalAddress || record.address || null,
      openingHours: metadata.openingHours?.length ? metadata.openingHours : (record.openingHours ?? []),
      keywords: [...new Set([...(Array.isArray(metadata.keywords) ? metadata.keywords : []), ...(record.keywords ?? [])])],
      sources,
    },
  };
  if (existing) await prisma.company.update({ where: { id: existing.id }, data });
  else await prisma.company.create({ data });
  return !existing;
}

async function search(page, term, location) {
  await page.goto("https://www.pagesjaunes.fr/", { waitUntil: "domcontentloaded", timeout: 45000 });
  const fields = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="checkbox"])')];
    const by = (re) => inputs.find((i) => re.test(`${i.name} ${i.id} ${i.placeholder} ${i.getAttribute("aria-label") ?? ""}`));
    const query = by(/quoiqui|quoi|recherche|activité|profession|métier/i);
    const where = by(/ou|localit|ville|lieu|adresse|position/i);
    return { queryIndex: inputs.indexOf(query), whereIndex: inputs.indexOf(where), count: inputs.length };
  });
  if (fields.queryIndex < 0 || fields.whereIndex < 0 || fields.queryIndex === fields.whereIndex) {
    throw new Error(`Champs PagesJaunes introuvables (inputs détectés: ${fields.count}).`);
  }
  const searchInputs = await page.$$('input:not([type="hidden"]):not([type="submit"]):not([type="checkbox"])');
  const fillInput = async (input, value) => {
    await input.click({ clickCount: 3 });
    await input.press("Backspace");
    await input.type(value);
  };
  await fillInput(searchInputs[fields.queryIndex], term);
  await fillInput(searchInputs[fields.whereIndex], location);
  const submit = await page.$('form button[type="submit"], form input[type="submit"]');
  const previousUrl = page.url();
  const navigation = page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
  const urlChange = page.waitForFunction((url) => location.href !== url, { timeout: 15000 }, previousUrl).catch(() => {});
  if (submit) {
    await submit.click();
  } else {
    await searchInputs[fields.whereIndex].press("Enter");
  }
  await Promise.race([navigation, urlChange]);
  await page.waitForFunction(() => document.readyState === "complete", { timeout: 10000 }).catch(() => {});
  return page.evaluate((cap) => {
    const clean = (value) => (value ?? "").replace(/\s+/g, " ").trim();
    const seen = new Set();
    const rows = [];
    const links = [...document.querySelectorAll('a[href*="/pros/"]')];
    for (const link of links) {
      const href = new URL(link.href, location.href).href.split("#")[0];
      const card = link.closest("article, li, [class*='bi-'], [class*='result'], [class*='annonce']") ?? link.parentElement?.parentElement;
      const text = clean(card?.innerText ?? link.innerText);
      if (seen.has(href) || !text) continue;
      seen.add(href);
      const name = clean(link.innerText) || clean(card?.querySelector("h2,h3,[class*='name']")?.innerText);
      const anchors = [...(card?.querySelectorAll("a") ?? [])];
      const websiteLink = anchors.find((a) => /site web|visiter le site|site officiel|website/i.test(`${a.innerText} ${a.getAttribute("aria-label") ?? ""}`));
      const external = websiteLink?.href ?? "";
      rows.push({
        name,
        sourceUrl: href,
        address: clean(card?.querySelector("address,[class*='address'],[class*='localisation']")?.innerText),
        phones: [...new Set([...card?.querySelectorAll("a[href^='tel:']") ?? []].map((a) => clean(a.innerText || a.getAttribute("href")?.replace(/^tel:/, ""))).filter(Boolean))],
        activity: clean(card?.querySelector("[class*='activity'],[class*='rubrique'],[class*='description']")?.innerText) || text.slice(name.length, name.length + 500),
        website: external,
      });
      if (rows.length >= cap) break;
    }
    return { title: document.title, url: location.href, blocked: /captcha|accès refusé|robot/i.test(document.body?.innerText ?? ""), rows };
  }, maxResults);
}

async function inspectListing(page, row, term, location) {
  await page.goto(row.sourceUrl, { waitUntil: "domcontentloaded", timeout: 35000 });
  await page.waitForFunction(() => document.readyState === "complete", { timeout: 10000 }).catch(() => {});
  const details = await page.evaluate(() => {
    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const meta = (selector) => clean(document.querySelector(selector)?.content);
    const records = [];
    const collect = (value) => {
      if (Array.isArray(value)) return value.forEach(collect);
      if (!value || typeof value !== "object") return;
      if (value["@graph"]) collect(value["@graph"]);
      const type = Array.isArray(value["@type"]) ? value["@type"].join(" ") : value["@type"] ?? "";
      if (/organization|localbusiness|store|professionalservice/i.test(type)) records.push(value);
    };
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try { collect(JSON.parse(script.textContent ?? "null")); } catch { /* malformed structured data */ }
    }
    const business = records.find((item) => item.name || item.telephone || item.address) ?? {};
    const addressValue = business.address;
    const address = typeof addressValue === "string" ? addressValue : addressValue && typeof addressValue === "object"
      ? [addressValue.streetAddress, addressValue.postalCode, addressValue.addressLocality, addressValue.addressRegion].filter(Boolean).join(", ")
      : clean(document.querySelector("address,[class*='address'],[class*='localisation']")?.innerText);
    const phoneValues = [business.telephone, ...(business.contactPoint ?? []).map?.((item) => item.telephone) ?? [], ...[...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute("href")?.replace(/^tel:/i, "")), ...[...document.querySelectorAll('[class*="phone"]')].map((node) => node.innerText)];
    const phones = [...new Set(phoneValues.flatMap((value) => Array.isArray(value) ? value : [value]).map(clean).filter(Boolean))];
    const hours = business.openingHoursSpecification ?? business.openingHours ?? [];
    const openingHours = (Array.isArray(hours) ? hours : [hours]).flatMap((item) => {
      if (typeof item === "string") return [clean(item)];
      if (!item || typeof item !== "object") return [];
      const days = Array.isArray(item.dayOfWeek) ? item.dayOfWeek : [item.dayOfWeek ?? ""];
      return days.filter(Boolean).map((day) => `${String(day).split(/[\/#]/).at(-1)} ${item.opens ?? ""}${item.closes ? `–${item.closes}` : ""}`.trim());
    });
    const visibleHours = clean(document.querySelector('[class*="horaire"],[class*="opening"],table[class*="hour"]')?.innerText);
    if (!openingHours.length && visibleHours) openingHours.push(visibleHours);
    const websiteAnchor = [...document.querySelectorAll("a[href]")].find((a) => /site web|visiter le site|website|site officiel/i.test(`${a.innerText} ${a.getAttribute("aria-label") ?? ""}`));
    const external = (raw) => {
      try {
        const url = new URL(raw, location.href);
        return /^https?:$/.test(url.protocol) && !/(^|\.)pagesjaunes\.fr$|(^|\.)facebook\.com$|(^|\.)linkedin\.com$|(^|\.)instagram\.com$|(^|\.)google\.[a-z.]+$/i.test(url.hostname) ? url.href : "";
      } catch { return ""; }
    };
    const website = external(business.url ?? "") || external(websiteAnchor?.href ?? "");
    const keywords = [meta('meta[name="keywords"]'), ...[...document.querySelectorAll('[class*="rubrique"],[class*="activit"],a[href*="/annuaire/"]')].map((item) => item.innerText)]
      .flatMap((value) => String(value ?? "").split(/[,;|]/)).map(clean).filter(Boolean);
    const description = clean(business.description) || meta('meta[name="description"]') || meta('meta[property="og:description"]') || clean(document.querySelector('[class*="description"],[class*="presentation"]')?.innerText);
    return {
      name: clean(business.name), address, phones, openingHours,
      website,
      description: description.slice(0, 4000),
      keywords: [...new Set(keywords)].slice(0, 40),
    };
  });
  return {
    ...row,
    name: details.name || row.name,
    address: details.address || row.address,
    phones: [...new Set([...(row.phones ?? []), ...details.phones])],
    website: details.website || row.website,
    description: details.description,
    keywords: [...new Set([term, location, row.activity, ...details.keywords].filter(Boolean))],
    openingHours: details.openingHours,
  };
}

let browser;
const counts = { searches: 0, found: 0, visited: 0, created: 0, updated: 0, errors: 0 };
try {
  browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1365, height: 900 });
  await page.setUserAgent("Mozilla/5.0 (compatible; PKidaCompanyDirectory/1.0; contact: support@pkida.fr)");
  for (let index = start; index < end; index++) {
    const { term, location } = combinations[index];
    try {
      const result = await search(page, term, location.name);
      if (result.blocked) throw new Error("PagesJaunes a présenté un contrôle anti-automatisation; arrêt du lot.");
      counts.searches++;
      counts.found += result.rows.length;
      console.log(`[${index + 1}/${combinations.length}] ${term} — ${location.name}: ${result.rows.length} résultats`);
      if (!dryRun) {
        for (const row of result.rows) {
          if (!row.name) continue;
          try {
            counts.visited++;
            const details = await inspectListing(page, row, term, location.name);
            const created = await saveCompany({ ...details, searchTerm: term, searchedLocation: location.name });
            counts[created ? "created" : "updated"]++;
            await pause(detailDelayMs);
          } catch (error) {
            counts.errors++;
            console.warn(`  Fiche incomplète (${row.name}): ${error.message}`);
            try {
              const created = await saveCompany({ ...row, searchTerm: term, searchedLocation: location.name });
              counts[created ? "created" : "updated"]++;
            } catch (saveError) {
              console.warn(`  Enregistrement ignoré (${row.name}): ${saveError.message}`);
            }
            await pause(detailDelayMs);
          }
        }
      }
      if (!dryRun) {
        state.planVersion = planVersion;
        state.nextIndex = index + 1;
        await mkdir(dirname(fileURLToPath(stateUrl)), { recursive: true });
        await writeFile(stateUrl, JSON.stringify(state, null, 2));
      }
      if (index + 1 < end) await pause(delayMs);
    } catch (error) {
      counts.errors++;
      console.error(`[${index + 1}] ${term} — ${location.name}: ${error.message}`);
      if (/contrôle anti-automatisation/i.test(error.message)) break;
      // Keep the failed combination as the resume point.
      if (!dryRun) {
        state.planVersion = planVersion;
        state.nextIndex = index;
        await mkdir(dirname(fileURLToPath(stateUrl)), { recursive: true });
        await writeFile(stateUrl, JSON.stringify(state, null, 2));
      }
      break;
    }
  }
  console.log(`Lot terminé: ${counts.searches} recherches, ${counts.found} fiches trouvées, ${counts.visited} fiches visitées, ${counts.created} entreprises créées, ${counts.updated} complétées, ${counts.errors} erreurs.`);
} finally {
  await browser?.close();
  await prisma?.$disconnect();
}
