const settingsGroups = [
  {
    title: "Organisation",
    description: "Gestion du nom, des membres et du contexte de recrutement.",
    items: ["Nom de l'organisation", "Membres", "Roles"],
  },
  {
    title: "Notifications",
    description: "Parametres d'envoi pour les invitations et rappels candidats.",
    items: ["WhatsApp", "Email", "SMS"],
  },
  {
    title: "Securite",
    description: "Regles d'acces et protection des donnees de recrutement.",
    items: ["Sessions", "Acces", "Donnees"],
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Parametres
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Configuration de l&apos;espace
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Centralisez les reglages utiles pour administrer votre espace
            recruteur Packid.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {settingsGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-lg border border-slate-800 bg-slate-900/70 p-6"
            >
              <h2 className="text-xl font-semibold text-white">{group.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {group.description}
              </p>
              <div className="mt-6 space-y-2">
                {group.items.map((item) => (
                  <button
                    key={item}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
                  >
                    <span>{item}</span>
                    <span className="text-slate-500">A venir</span>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Preferences produit
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Ces options seront connectees aux reglages persistants dans une
                prochaine etape.
              </p>
            </div>
            <button className="rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              Enregistrer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
