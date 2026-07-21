import Link from "next/link";
import CreateCandidateForm from "../components/CreateCandidateForm";
import { getJobOffers } from "../lib/server/recruitmentService";

export const dynamic = "force-dynamic";

export default async function AddCandidatePage() {
  const jobs = await getJobOffers();

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Creation candidat
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Inviter un candidat
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Le candidat recoit un lien securise vers l&apos;entretien Packid.
          </p>
        </header>

        {jobs.length > 0 ? (
          <CreateCandidateForm jobs={jobs} />
        ) : (
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-300">
              Creez une entreprise et une offre avant d&apos;ajouter un candidat.
            </p>
            <Link
              href="/companies/new"
              className="mt-5 inline-flex rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Demarrer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
