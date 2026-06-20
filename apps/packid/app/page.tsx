import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
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
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-300"
                >
                  Voir les fonctionnalités
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_15px_35px_-20px_rgba(56,189,248,0.9)] transition hover:from-cyan-300 hover:to-violet-400"
                >
                  Se connecter
                </a>
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950 p-8 shadow-xl shadow-slate-950/30">
              <div className="space-y-5">
                <div className="rounded-3xl bg-slate-900/90 p-6">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
                    Prise en main rapide
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold text-white">
                    Analyse de CV en 1 clic
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Transformez les CV en fiches de compétences exploitables,
                    avec résumé automatique et note de pertinence.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/90 p-5">
                    <p className="text-sm font-semibold text-emerald-300">
                      Qualification
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      Classement des profils selon critères métier, expérience,
                      soft skills et culture d’équipe.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-5">
                    <p className="text-sm font-semibold text-emerald-300">
                      Intégration
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      Connexion simple à vos outils RH, ATS et espaces
                      collaboratifs pour un workflow sans rupture.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-8 lg:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-100 shadow-lg shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">
              1. Analyse intelligente des CV
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              L’agent lit chaque CV, extrait les compétences clés, met en
              lumière l’expérience pertinente et propose un score de match
              adapté au poste.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-100 shadow-lg shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">
              2. Qualification automatique
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Évaluez les candidats sur la base de critères personnalisés,
              générez des résumés de profil et identifiez les talents à
              prioriser.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-100 shadow-lg shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">
              3. Environnement de travail intégré
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Synchronisez les résultats avec votre ATS, partagez les fiches
              avec vos équipes et conservez une vision claire du pipeline
              candidat.
            </p>
          </article>
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
                href="#contact"
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
                Email: <span className="text-white">contact@recrutopia.ai</span>
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
