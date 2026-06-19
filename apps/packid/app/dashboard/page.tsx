import Link from "next/link";
import CandidateCard from "../components/CandidateCard";
import { getCurrentUser } from "../lib/server/authService";
import { getDashboardData } from "../lib/server/recruitmentService";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [user, dashboardData] = await Promise.all([
    getCurrentUser(),
    getDashboardData(),
  ]);
  const { candidates, jobs, kpis } = dashboardData;
  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "patron";

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
                Packid MVP V2
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                Bonjour {userName}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Je prepare votre tableau de bord: candidats a suivre, entretiens
                termines, scores et recommandations sont prets pour vos decisions.
                Je reste a vos cotes pour prioriser la suite.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/companies/new"
                className="rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Entreprise
              </Link>
              <Link
                href="/jobs/new"
                className="rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Offre
              </Link>
              <Link
                href="/add"
                className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Candidat
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-4">
          {[
            ["Candidats", kpis.candidates],
            ["Entretiens termines", kpis.completed],
            ["Score moyen", `${kpis.averageScore}/100`],
            ["Completion", `${kpis.completionRate}%`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl bg-slate-900/90 p-6 ring-1 ring-white/10"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
            <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Classement candidats
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Tri automatique par score puis date de creation.
                </p>
              </div>
              <Link
                href="/search"
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Recherche avancee
              </Link>
            </div>
            <div className="space-y-4">
              {candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))
              ) : (
                <p className="rounded-3xl bg-slate-950/95 p-6 text-sm text-slate-400">
                  Aucun candidat pour le moment.
                </p>
              )}
            </div>
          </div>

          <aside className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
            <h2 className="text-2xl font-semibold text-white">Offres actives</h2>
            <div className="mt-6 space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-3xl bg-slate-950/95 p-5 ring-1 ring-slate-800/70"
                >
                  <p className="font-semibold text-white">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{job.company.name}</p>
                  <p className="mt-3 text-sm text-cyan-300">
                    {job._count.candidates} candidat(s)
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
