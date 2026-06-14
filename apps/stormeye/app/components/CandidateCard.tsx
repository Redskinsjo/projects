import Link from "next/link";
import type { Candidate } from "@/app/generated/prisma/client";

export default function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-5 shadow-lg shadow-slate-950/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/candidate/${candidate.id}`}
            className="text-base font-semibold text-white hover:text-cyan-300"
          >
            {candidate.name}
          </Link>
          <p className="mt-1 text-sm text-slate-500">{candidate.title}</p>
        </div>
        {candidate.match ? (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {candidate.match}
          </span>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Canal
          </p>
          <p className="mt-2 text-sm text-slate-200">
            {candidate.conversation}
          </p>
        </div>
        <div className="rounded-3xl bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            État
          </p>
          <p className="mt-2 text-sm text-slate-200">{candidate.keyword}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {candidate.conversationKeywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300"
          >
            {keyword}
          </span>
        ))}
      </div>
      <Link
        href={`/candidate/${candidate.id}`}
        className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:shadow-xl hover:shadow-cyan-500/50 hover:-translate-y-0.5"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="h-4 w-4"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          <path d="M16 8v4m0 2v2" />
        </svg>
        Profil
      </Link>
    </div>
  );
}
