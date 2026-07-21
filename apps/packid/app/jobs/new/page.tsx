import CreateJobForm from "@/app/components/CreateJobForm";
import { getCompanies } from "@/app/lib/server/recruitmentService";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const companies = await getCompanies();

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Offre
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Creer une offre
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Importez une fiche de poste ou renseignez les informations de l&apos;offre.
          </p>
        </header>
        <CreateJobForm companies={companies} />
      </div>
    </div>
  );
}
