import Link from "next/link";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "./lib/contact";

const primaryFeatures = [
  {
    title: "Import intelligent",
    summary:
      "Packid lit les CV et les fiches de poste, extrait les informations utiles et pre-remplit les formulaires.",
    details: ["PDF, Word et texte", "Champs reconnus", "Donnees controlables"],
  },
  {
    title: "Qualification IA",
    summary:
      "Chaque profil est resume, compare a l'offre et classe pour aider le recruteur a prioriser.",
    details: ["Score candidat", "Forces et limites", "Recommandation claire"],
  },
  {
    title: "Entretiens candidats",
    summary:
      "Les candidats recoivent un lien d'entretien et repondent aux questions ecrites ou video.",
    details: ["Lien securise", "WhatsApp et email", "Conversation centralisee"],
  },
  {
    title: "Pilotage recruteur",
    summary:
      "Le tableau de bord rassemble offres, candidats, statuts, scores et rapports dans une vue exploitable.",
    details: ["Dashboard", "Recherche avancee", "Archives et suivi"],
  },
];

const dashboardPreview = [
  ["Candidats analyses", "128"],
  ["Temps gagne", "6 h / semaine"],
  ["Score moyen", "82/100"],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/95 px-6 py-4 backdrop-blur sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-white"
          >
            Packid
          </Link>
          <nav className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Découvrir la démo
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-300"
            >
              Fonctionnalités
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_15px_35px_-20px_rgba(56,189,248,0.9)] transition hover:from-cyan-300 hover:to-violet-400"
            >
              Se connecter
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-16 sm:px-10">
        <section className="rounded-3xl bg-slate-900/80 p-10 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-emerald-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300 ring-1 ring-emerald-300/20">
                Outil IA pour recruteurs
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Optimisez le recrutement avec un agent intelligent.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Analyse automatique des CV, qualification rapide des talents et
                intégration fluide dans vos outils métier pour des recrutements
                plus rapides, plus précis et plus humains.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Découvrir la démo
                </a>
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-slate-950/30">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
                    Tableau recruteur
                  </p>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    En direct
                  </span>
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-white">
                  Les bons profils remontent avant les autres.
                </h2>
                <div className="mt-6 grid gap-3">
                  {dashboardPreview.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3"
                    >
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="text-lg font-semibold text-white">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <p className="text-sm font-semibold text-cyan-200">
                  Prochaine action recommandee
                </p>
                <p className="mt-2 text-sm leading-6 text-cyan-50">
                  Importer une offre, inviter les candidats pertinents, puis
                  consulter les rapports classes par score.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-8">
          <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Fonctionnalités principales
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
                Un flux complet, de l&apos;offre au rapport candidat.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-400">
              Packid remplace les copier-coller, les tableaux disperses et les
              relances manuelles par un espace clair pour agir plus vite.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-cyan-400/25 bg-slate-900/90 p-8 shadow-2xl shadow-cyan-950/20">
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Fonction centrale
              </span>
              <h3 className="mt-5 text-3xl font-semibold text-white">
                Analyse, score et priorisation en une seule lecture.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Chaque candidature est transformee en dossier exploitable :
                competences reconnues, adequation avec l&apos;offre, niveau estime,
                points forts, points faibles et recommandation d&apos;action.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["Resume clair", "Score de match", "Decision guidee"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{item}</p>
                    </div>
                  ),
                )}
              </div>
            </article>

            <div className="grid gap-5">
              {primaryFeatures.slice(0, 2).map((feature, index) => (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6"
                >
                  <p className="text-sm font-semibold text-emerald-300">
                    0{index + 1}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {feature.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {primaryFeatures.slice(2).map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">
                      0{index + 3}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    Inclus
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {feature.details.map((detail) => (
                    <span
                      key={detail}
                      className="rounded-full bg-slate-950 px-3 py-1 text-xs text-slate-300 ring-1 ring-slate-800"
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-slate-100 shadow-2xl shadow-slate-950/30 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
              Pourquoi choisir cet outil ?
            </span>
            <h2 className="text-3xl font-semibold text-white">
              Recrutez mieux, plus vite, avec plus de confiance.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-slate-300">
              Notre solution combine l’intelligence artificielle avec
              l’expertise métier pour alléger les tâches répétitives du
              recruteur, accélérer la qualification des profils et améliorer
              l’adoption en entreprise.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700/50">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Gain de temps
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Automatisez l’analyse et la sélection initiale pour concentrer
                vos efforts sur les meilleurs candidats.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700/50">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Décisions plus précises
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Bénéficiez d’évaluations structurées qui réduisent les biais et
                clarifient les priorités.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700/50">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Alignement équipe
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Centralisez les retours et les évaluations pour fluidifier la
                collaboration entre recruteurs et managers.
              </p>
            </div>
          </div>
        </section>

        <section
          id="demo"
          className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-10 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-700/60"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold text-white">
                Prêt à transformer votre processus de recrutement ?
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Testez dès maintenant un assistant IA conçu pour rendre le
                sourcing, la qualification et l’intégration métier plus
                efficaces sans changer vos habitudes de travail.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Contactez-nous
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                En savoir plus
              </a>
            </div>
          </div>
        </section>

        <footer
          id="contact"
          className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-300 shadow-lg shadow-slate-950/10"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
                Agent IA recrutement
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Conçu pour les équipes RH, les cabinets et les entreprises
                exigeantes.
              </p>
              <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link
                  href="/privacy-policy"
                  className="font-medium text-slate-200 transition hover:text-emerald-300"
                >
                  Politique de confidentialité
                </Link>
                <Link
                  href="/terms-of-service"
                  className="font-medium text-slate-200 transition hover:text-emerald-300"
                >
                  Conditions de service
                </Link>
                <Link
                  href="/user-data-deletion"
                  className="font-medium text-slate-200 transition hover:text-emerald-300"
                >
                  Suppression de données utilisateur
                </Link>
              </nav>
            </div>
            <div className="space-y-2 text-sm sm:text-right">
              <p>
                Email:{" "}
                <a
                  href={CONTACT_MAILTO}
                  className="font-medium text-white transition hover:text-emerald-300"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                Intégration ATS, Slack, ou espace collaboratif selon vos
                besoins.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
