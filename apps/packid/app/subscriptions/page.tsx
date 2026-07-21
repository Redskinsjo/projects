const plans = [
  {
    name: "Essentiel",
    price: "49 EUR",
    description: "Pour demarrer avec un suivi simple des offres et candidats.",
    features: ["Tableau de bord", "Import CV et offres", "Entretiens IA"],
  },
  {
    name: "Equipe",
    price: "149 EUR",
    description: "Pour structurer les recrutements d'une organisation.",
    features: ["Collaborateurs", "Connecteurs", "Rapports avances"],
  },
  {
    name: "Entreprise",
    price: "Sur devis",
    description: "Pour les equipes avec besoins de gouvernance et volumes.",
    features: ["SLA dedie", "SSO", "Accompagnement integration"],
  },
];

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Abonnements
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Offre et facturation
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Consultez les formules Packid et preparez l&apos;evolution de votre
            espace recruteur.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="rounded-lg border border-slate-800 bg-slate-900/70 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {plan.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {plan.description}
                  </p>
                </div>
                <span className="rounded-md bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
                  {plan.price}
                </span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
                Selectionner
              </button>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">
            Etat actuel
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ["Formule", "MVP"],
              ["Facturation", "Non configuree"],
              ["Renouvellement", "A definir"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-slate-800 bg-slate-950/70 p-4"
              >
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 font-medium text-slate-100">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
