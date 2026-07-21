import Link from "next/link";
import ArchiveCandidateButton from "./ArchiveCandidateButton";
import DeleteCandidateButton from "./DeleteCandidateButton";

type CandidateCardData = {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  score: number | null;
  archivedAt?: Date | string | null;
  jobOffer: {
    title: string;
    company: {
      name: string;
    };
  };
  reports?: Array<{
    recommendation: string;
  }>;
};

const statusLabels: Record<string, string> = {
  INVITED: "Invite",
  STARTED: "Entretien demarre",
  COMPLETED: "Termine",
  ANALYZED: "Analyse",
  SHORTLISTED: "Shortlist",
  REJECTED: "Rejete",
  HIRED: "Recrute",
};

export default function CandidateCard({
  candidate,
}: {
  candidate: CandidateCardData;
}) {
  const latestReport = candidate.reports?.[0];
  const isArchived = Boolean(candidate.archivedAt);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/90 p-5 shadow-sm shadow-slate-950/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/candidate/${candidate.id}`}
            className="text-base font-semibold text-white hover:text-cyan-300"
          >
            {candidate.firstName} {candidate.lastName}
          </Link>
          <p className="mt-1 text-sm text-slate-500">
            {candidate.jobOffer.title} · {candidate.jobOffer.company.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
            {statusLabels[candidate.status] ?? candidate.status}
          </span>
          {isArchived ? (
            <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
              Archive
            </span>
          ) : null}
          {typeof candidate.score === "number" ? (
            <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              {candidate.score}/100
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-xs font-medium text-slate-500">
            Recommandation
          </p>
          <p className="mt-2 text-sm text-slate-200">
            {latestReport?.recommendation ?? "En attente"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-xs font-medium text-slate-500">
            Interface
          </p>
          <p className="mt-2 text-sm text-slate-200">Entretien Packid</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/candidate/${candidate.id}`}
          className="inline-flex items-center rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Ouvrir le dossier
        </Link>
        <ArchiveCandidateButton
          candidateId={candidate.id}
          isArchived={isArchived}
        />
        {isArchived ? (
          <DeleteCandidateButton
            candidateId={candidate.id}
            candidateName={`${candidate.firstName} ${candidate.lastName}`}
          />
        ) : null}
      </div>
    </div>
  );
}
