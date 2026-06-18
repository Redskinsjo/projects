import CandidateCard from "../components/CandidateCard";
import { getCandidates, getJobOffers } from "../lib/server/recruitmentService";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; minScore?: string; jobId?: string }>;
}) {
  const params = await searchParams;
  const [allCandidates, jobs] = await Promise.all([getCandidates(), getJobOffers()]);
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
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Recherche
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Filtrer les candidats
          </h1>
        </header>

        <form className="grid gap-4 rounded-3xl bg-slate-900/80 p-6 ring-1 ring-slate-700/50 md:grid-cols-4">
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100"
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
            className="rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100"
          />
          <select
            name="jobId"
            defaultValue={params.jobId ?? ""}
            className="rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100"
          >
            <option value="">Toutes les offres</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <button className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950">
            Filtrer
          </button>
        </form>

        <div className="grid gap-4 lg:grid-cols-2">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </div>
    </div>
  );
}
