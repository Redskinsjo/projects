import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { readData } from "@/lib/store";

export const metadata = { title: "Ma recherche" };

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
            <span className="count-pill">0</span>
          </div>
          <p className="panel-description">
            Les opportunités réunies pour cette recherche apparaîtront ici.
          </p>
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              ⌕
            </span>
            <h3>Votre recherche est prête.</h3>
            <p>
              Vos critères sont enregistrés. Aucune source d’offres n’est encore
              connectée : la collecte n’a pas commencé.
            </p>
          </div>
          <div className="inline-note">
            Les offres à découvrir seront présentées ici. Vos démarches engagées
            resteront dans « Mes candidatures » sur votre espace.
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
                <dt>Maximum souhaité</dt>
                <dd>{research.pace} candidatures / jour</dd>
              </div>
              <div>
                <dt>Validation avant envoi</dt>
                <dd>{research.review ? "Oui" : "Non"}</dd>
              </div>
            </dl>
            <div className="inline-note">
              L’envoi automatique n’est pas encore activé. Ces préférences sont
              conservées pour sa mise en place.
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
