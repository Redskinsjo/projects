import Link from "next/link";
import CreateCandidateForm from "../components/CreateCandidateForm";
import { getJobOffers } from "../lib/server/recruitmentService";

export const dynamic = "force-dynamic";

export default async function AddCandidatePage() {
  const jobs = await getJobOffers();

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Creation candidat
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Inviter un candidat
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Le candidat recoit un lien securise vers l&apos;entretien Packid.
          </p>
        </header>

        {jobs.length > 0 ? (
          <CreateCandidateForm jobs={jobs} />
        ) : (
          <div className="rounded-3xl bg-slate-900/80 p-8 ring-1 ring-slate-700/50">
            <p className="text-sm text-slate-300">
              Creez une entreprise et une offre avant d&apos;ajouter un candidat.
            </p>
            <Link
              href="/companies/new"
              className="mt-5 inline-flex rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950"
            >
              Demarrer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
