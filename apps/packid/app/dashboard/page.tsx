import Link from "next/link";
import CandidateCard from "../components/CandidateCard";
import { getCurrentUser } from "../lib/server/authService";
import { getDashboardData } from "../lib/server/recruitmentService";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ includeArchived?: string }>;
}) {
  const params = await searchParams;
  const includeArchived = params.includeArchived === "true";
  const [user, dashboardData] = await Promise.all([
    getCurrentUser(),
    getDashboardData({ includeArchived }),
  ]);
  const { candidates, jobs, kpis } = dashboardData;
  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "patron";

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-800 pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Tableau de bord
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                Bonjour {userName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Je prepare votre tableau de bord: candidats a suivre, entretiens
                termines, scores et recommandations sont prets pour vos decisions.
                Je reste a vos cotes pour prioriser la suite.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Vue actuelle :{" "}
                {includeArchived
                  ? "tous les candidats, archives inclus"
                  : "candidats non archives uniquement"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={includeArchived ? "/dashboard" : "/dashboard?includeArchived=true"}
                className="rounded-lg border border-amber-400/30 px-4 py-2.5 text-sm font-medium text-amber-200 transition hover:border-amber-300 hover:bg-amber-400/10"
              >
                {includeArchived ? "Masquer archives" : "Inclure archives"}
              </Link>
              <Link
                href="/companies/new"
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
              >
                Entreprise
              </Link>
              <Link
                href="/jobs/new"
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
              >
                Offre
              </Link>
              <Link
                href="/add"
                className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
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
            <div key={label} className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Classement candidats
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Tri automatique par score puis date de creation.
                  {includeArchived
                    ? " Les candidats archives sont inclus dans cette vue."
                    : " Les candidats archives sont exclus par defaut."}
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
                <p className="rounded-lg border border-slate-800 bg-slate-950/80 p-5 text-sm text-slate-400">
                  Aucun candidat pour le moment.
                </p>
              )}
            </div>
          </div>

          <aside className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold text-white">Offres actives</h2>
            <div className="mt-6 space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/80 p-4"
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
