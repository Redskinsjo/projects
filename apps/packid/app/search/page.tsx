import CandidateCard from "../components/CandidateCard";
import { getCandidates, getJobOffers } from "../lib/server/recruitmentService";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    minScore?: string;
    jobId?: string;
    archived?: string;
  }>;
}) {
  const params = await searchParams;
  const archiveFilter =
    params.archived === "archived" || params.archived === "all"
      ? params.archived
      : "active";
  const [allCandidates, jobs] = await Promise.all([
    getCandidates({ archiveFilter }),
    getJobOffers(),
  ]);
  const minScore = Number(params.minScore ?? 0);
  const candidates = allCandidates.filter((candidate) => {
    const statusMatch = params.status ? candidate.status === params.status : true;
    const scoreMatch =
      Number.isFinite(minScore) && minScore > 0
        ? (candidate.score ?? 0) >= minScore
        : true;
    const jobMatch = params.jobId ? candidate.jobOfferId === params.jobId : true;

    return statusMatch && scoreMatch && jobMatch;
  });

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Recherche
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Filtrer les candidats
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Retrouvez rapidement les profils par statut, score, offre ou archive.
          </p>
        </header>

        <form className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-5">
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="rounded-lg border border-slate-800 bg-slate-950/95 px-3 py-2.5 text-sm text-slate-100"
          >
            <option value="">Tous les statuts</option>
            {[
              "INVITED",
              "STARTED",
              "COMPLETED",
              "ANALYZED",
              "SHORTLISTED",
              "REJECTED",
              "HIRED",
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            name="minScore"
            type="number"
            min="0"
            max="100"
            defaultValue={params.minScore ?? ""}
            placeholder="Score minimum"
            className="rounded-lg border border-slate-800 bg-slate-950/95 px-3 py-2.5 text-sm text-slate-100"
          />
          <select
            name="jobId"
            defaultValue={params.jobId ?? ""}
            className="rounded-lg border border-slate-800 bg-slate-950/95 px-3 py-2.5 text-sm text-slate-100"
          >
            <option value="">Toutes les offres</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <select
            name="archived"
            defaultValue={archiveFilter}
            className="rounded-lg border border-slate-800 bg-slate-950/95 px-3 py-2.5 text-sm text-slate-100"
          >
            <option value="active">Non archives</option>
            <option value="archived">Archives</option>
            <option value="all">Tous</option>
          </select>
          <button className="rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
            Filtrer
          </button>
        </form>

        <div className="grid gap-4 xl:grid-cols-2">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </div>
    </div>
  );
}
