const communicationConnectors = [
  {
    name: "WhatsApp",
    status: "Pret a configurer",
    description:
      "Envoyez les liens d'entretien et les relances via WhatsApp Business.",
    modes: [
      "Communication standard Stormeye",
      "Compte WhatsApp client avec connexion dediee",
    ],
  },
  {
    name: "SMS",
    status: "Simulation active",
    description:
      "Utilisez les SMS pour les candidats qui repondent peu aux emails.",
    modes: ["Provider SMS Stormeye", "Provider SMS client"],
  },
  {
    name: "Email",
    status: "Simulation active",
    description:
      "Centralisez invitations, rappels et rapports envoyes aux candidats.",
    modes: ["Domaine Stormeye", "SMTP ou domaine client"],
  },
];

const workspaceConnectors = [
  {
    name: "Google Workspace",
    description: "Synchronisation Gmail, Calendar et Drive pour les recruteurs.",
  },
  {
    name: "Microsoft 365",
    description: "Connexion Outlook, Teams, Calendar et OneDrive.",
  },
  {
    name: "Slack",
    description: "Notifications internes sur les etapes importantes du pipeline.",
  },
  {
    name: "LinkedIn Recruiter",
    description: "Preparation future pour rapprocher sourcing et suivi candidat.",
  },
  {
    name: "Notion",
    description: "Export des syntheses de recrutement dans les espaces RH.",
  },
  {
    name: "Google Meet",
    description: "Creation de liens d'entretien humain apres prequalification IA.",
  },
];

export default function ConnectorsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Environnement de travail
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Connecteurs
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Ajoutez les canaux de communication et les outils metier qui
            alimentent vos workflows de recrutement.
          </p>
        </header>

        <section className="rounded-[2rem] bg-slate-900/90 p-8 ring-1 ring-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                Communication candidat
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Canaux disponibles
              </h2>
            </div>
            <span className="rounded-full bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 ring-1 ring-cyan-300/20">
              3 canaux
            </span>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {communicationConnectors.map((connector) => (
              <article
                key={connector.name}
                className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">
                    {connector.name}
                  </h3>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    {connector.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {connector.description}
                </p>
                <div className="mt-5 space-y-2">
                  {connector.modes.map((mode) => (
                    <label
                      key={mode}
                      className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200"
                    >
                      <input
                        type="radio"
                        name={`${connector.name}-mode`}
                        defaultChecked={mode.includes("Stormeye")}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
                <button className="mt-5 w-full rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                  Configurer
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] bg-slate-900/90 p-8 ring-1 ring-white/10">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
              WhatsApp client
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Connexion personnalisee
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              <p>
                Le mode standard laisse Stormeye piloter l&apos;envoi depuis son
                infrastructure. C&apos;est le plus simple pour demarrer.
              </p>
              <p>
                Le mode compte client doit idealement passer par WhatsApp
                Business Platform officielle avec Meta Business, un phone number
                id et un access token client.
              </p>
              <p>
                L&apos;option Raspberry avec un QR code et whatsapp-js peut marcher
                techniquement pour un prototype, mais elle s&apos;appuie sur WhatsApp
                Web, plus fragile et moins adaptee a un SaaS professionnel.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-900/90 p-8 ring-1 ring-white/10">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
              Applications RH
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Connecteurs a prevoir
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {workspaceConnectors.map((connector) => (
                <article
                  key={connector.name}
                  className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5"
                >
                  <h3 className="font-semibold text-white">{connector.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {connector.description}
                  </p>
                  <button className="mt-5 rounded-3xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
                    Ajouter
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
