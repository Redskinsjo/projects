import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { readData } from "@/lib/store";
import { getDatabase } from "@/lib/prisma";
import { RunSearchButton } from "@/components/run-search-button";

export const metadata = { title: "Ma recherche" };

function matchingKeywords(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const keywords = (value as { keywords?: unknown }).keywords;
  return Array.isArray(keywords) ? keywords.filter((word): word is string => typeof word === "string") : [];
}

function salaryLabel(min: number | null, max: number | null, currency: string | null) {
  if (min === null && max === null) return "Salaire non indiqué par la source";
  const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
  const unit = currency ?? "€";
  if (min !== null && max !== null && min !== max) return `${formatter.format(min)}–${formatter.format(max)} ${unit}`;
  return `${formatter.format(min ?? max!)} ${unit}`;
}

const excludedBoardDomains = [
  "jobijoba.com", "jobijoba.fr", "agefiph.fr", "glassdoor.com", "hellowork.com",
  "jooble.org", "francetravail.fr", "cadremploi.fr", "indeed.com",
  "welcometothejungle.com", "apec.fr", "monster.fr", "jobteaser.com",
  "stepstone.fr", "talent.com", "meteojob.com", "optioncarriere.com",
  "careerjet.fr", "careerjet.com", "jobrapido.com", "adzuna.fr", "adzuna.com",
  "joblift.fr", "joblift.com", "recrut.com", "emploi.org", "lesjeudis.com",
  "regionsjob.com", "emploipublic.fr", "choisirleservicepublic.gouv.fr",
];

function isBoardUrl(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return excludedBoardDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return true;
  }
}

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const data = await readData(user);
  const research = data.campaigns.find((campaign) => campaign.id === id);
  if (!research) notFound();
  const db = getDatabase();
  const dbResearch = await db.research.findFirst({
    where: { id, userId: user.id },
  });
  if (!dbResearch) notFound();
  const matches = await db.researchMatch.findMany({
    where: {
      researchId: id,
      dismissedAt: null,
      notifiedAt: { not: null },
      offer: { sources: { some: { type: { in: ["CAREER_SITE", "SOCIAL_NETWORK"] } } } },
    },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    include: { offer: { include: { company: true, sources: true } } },
  });
  const visibleMatches = matches.filter((match) =>
    match.offer.sources.some((source) => !isBoardUrl(source.sourceUrl) &&
      (source.type === "SOCIAL_NETWORK" || source.type === "CAREER_SITE")),
  );

  const criteria = [
    ["Poste recherché", research.role],
    ["Lieu", research.location],
    [
      "Salaire minimum brut annuel",
      `${research.salary.toLocaleString("fr-FR")} €`,
    ],
    [
      "Expérience",
      `${research.experience} an${research.experience > 1 ? "s" : ""}`,
    ],
    ["Contrat", research.contract],
    ["Mode de travail", research.remote],
    ["Mots-clés à privilégier", research.keywords || "Non précisés"],
    [
      "Entreprises ou mots-clés à exclure",
      research.exclusions || "Aucune exclusion",
    ],
  ];

  return (
    <main className="container campaign-page research-page">
      <Link className="back-link" href="/espace">
        ← Mon espace
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            MA RECHERCHE <span className="badge">{research.status}</span>
          </span>
          <h1>{research.title}</h1>
          <p>
            Créée le {new Date(research.createdAt).toLocaleDateString("fr-FR")}{" "}
            · {research.role} · {research.location}
          </p>
        </div>
        <Link className="button" href="/espace/recherches/nouvelle">
          ＋ Nouvelle recherche
        </Link>
      </div>
      <div className="research-layout">
        <section
          className="panel research-offers"
          aria-labelledby="offers-title"
        >
          <div className="panel-title">
            <h2 id="offers-title">Offres correspondantes</h2>
            <span className="count-pill">{visibleMatches.length}</span>
          </div>
          <p className="panel-description">
            Les offres trouvées sur le web sont conservées ici et dédupliquées
            entre vos recherches.
          </p>
          <div className="offer-search-action">
            <RunSearchButton
              researchId={research.id}
              status={research.status}
            />
            {dbResearch.lastRunAt ? (
              <small>
                Dernière recherche :{" "}
                {new Date(dbResearch.lastRunAt).toLocaleString("fr-FR")}
              </small>
            ) : null}
          </div>
          {dbResearch.lastError ? (
            <p className="inline-note" role="status">
              Dernière erreur : {dbResearch.lastError}
            </p>
          ) : null}
          {visibleMatches.length ? (
            <div className="offer-results">
              {visibleMatches.map((match) => {
                const { id: matchId, score, offer } = match;
                const keywords = matchingKeywords(match.matchReasons);
                const sources = offer.sources.filter((source) => !isBoardUrl(source.sourceUrl));
                return (
                <article className="panel offer-card" key={matchId}>
                  <div className="panel-title">
                    <h3>{offer.title}</h3>
                    <span className="count-pill">{score}%</span>
                  </div>
                  <p className="offer-company">
                    Entreprise : {offer.company?.name ?? "À confirmer"}
                  </p>
                  {sources.some((source) => source.type === "SOCIAL_NETWORK") ? (
                    <p className="inline-note">
                      Post LinkedIn public repéré par l’index web. L’appartenance du compte à l’entreprise doit être vérifiée sur LinkedIn.
                    </p>
                  ) : null}
                  <p>
                    {offer.description ||
                      "Aucune description fournie par la source."}
                  </p>
                  <div className="offer-metadata">
                    <span>Salaire : {salaryLabel(offer.salaryMin, offer.salaryMax, offer.salaryCurrency)}</span>
                    <span>Lieu : {offer.location || "Non indiqué par la source"}</span>
                    {offer.company?.sector || offer.company?.industry ? (
                      <span>
                        {[offer.company.sector, offer.company.industry]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    ) : null}
                    {offer.employmentType ? (
                      <span>{offer.employmentType}</span>
                    ) : null}
                    {offer.workplaceType ? (
                      <span>{offer.workplaceType}</span>
                    ) : null}
                    {offer.postedAt ? (
                      <span>
                        Publiée le{" "}
                        {new Date(offer.postedAt).toLocaleDateString("fr-FR")}
                      </span>
                    ) : null}
                  </div>
                  {keywords.length ? (
                    <div className="offer-keywords" aria-label="Mots-clés correspondants">
                      <strong>Mots-clés retrouvés :</strong>
                      {keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
                    </div>
                  ) : null}
                  {offer.company?.description ? (
                    <p><strong>À propos :</strong> {offer.company.description}</p>
                  ) : null}
                  <div className="offer-links">
                    {sources.map((source) => (
                      <a
                        key={source.id}
                        href={source.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {source.type === "SOCIAL_NETWORK" ? "Voir le post LinkedIn" : "Voir l’offre sur le site carrière"} ↗
                      </a>
                    ))}
                  </div>
                </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">
                ⌕
              </span>
              <h3>
                {dbResearch.lastRunAt
                  ? "Aucune offre trouvée pour le moment."
                  : "Votre recherche est prête."}
              </h3>
              <p>
                {dbResearch.lastRunAt
                  ? "Relancez la recherche plus tard pour repérer les nouvelles annonces."
                  : "Lancez une recherche web pour trouver des offres correspondant à vos critères."}
              </p>
            </div>
          )}
          <div className="inline-note">
            Les offres enregistrées ne créent pas automatiquement une
            candidature. Vos démarches engagées restent dans « Mes candidatures
            » sur votre espace.
          </div>
          <Link className="text-button research-back" href="/espace">
            Retrouver mes candidatures ↗
          </Link>
        </section>
        <aside className="research-settings">
          <section className="panel recap" aria-labelledby="criteria-title">
            <span className="eyebrow">VOTRE CAP</span>
            <h2 id="criteria-title">Les critères de recherche</h2>
            <dl>
              {criteria.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <h3>Préférences d’envoi</h3>
            <dl>
              <div>
                <dt>Maximum d’offres souhaité</dt>
                <dd>{research.pace} offres / jour</dd>
              </div>
              <div>
                <dt>Décider moi-même si je postule</dt>
                <dd>{research.review ? "Oui" : "Non"}</dd>
              </div>
            </dl>
            <div className="inline-note">
              Les résultats s’affichent ici. La recherche automatique
              quotidienne peut être déclenchée par le planificateur configuré
              pour PKida.
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
