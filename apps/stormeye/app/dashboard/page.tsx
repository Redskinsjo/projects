import CandidateCard from "../components/CandidateCard";
import { getAllCandidates } from "../lib/server/candidateService";

export default async function DashboardPage() {
  const candidates = await getAllCandidates();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-emerald-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300 ring-1 ring-emerald-300/20">
                Tableau de bord recruteur
              </span>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Suivi des candidats en qualification
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                  Visualisez en un coup d’œil l’état des candidatures, la
                  progression des conversations et l’intégration de vos outils
                  métier.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/80 p-6 ring-1 ring-slate-700/50">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  Candidats en qualification
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">12</p>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-6 ring-1 ring-slate-700/50">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  Outils connectés
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">4</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-4 pb-6 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Candidats en cours
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Suivi prioritaire des dossiers ouverts et de leur avance dans
                  le pipeline.
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Qualification active
              </span>
            </div>

            <div className="space-y-4">
              {candidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Outils connectés
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Suivez l’état des intégrations qui alimentent vos workflows.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl bg-slate-950/95 p-5 ring-1 ring-slate-800/60">
                  <p className="text-sm text-slate-400">ATS</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Greenhouse
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Synchronisation en temps réel des candidatures.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/95 p-5 ring-1 ring-slate-800/60">
                  <p className="text-sm text-slate-400">Messagerie</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Slack et Email
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Conversations et alertes centralisées.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/95 p-5 ring-1 ring-slate-800/60">
                  <p className="text-sm text-slate-400">Calendrier</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Google Agenda
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Invitations et relances intégrées.
                  </p>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-5 ring-1 ring-slate-700/50">
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
                  Vue rapide
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center justify-between gap-4">
                    <span>CVs analysés aujourd’hui</span>
                    <strong className="text-white">24</strong>
                  </li>
                  <li className="flex items-center justify-between gap-4">
                    <span>Conversations actives</span>
                    <strong className="text-white">8</strong>
                  </li>
                  <li className="flex items-center justify-between gap-4">
                    <span>Références à relancer</span>
                    <strong className="text-white">3</strong>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
