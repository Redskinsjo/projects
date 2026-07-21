import CreateCompanyForm from "@/app/components/CreateCompanyForm";

export const dynamic = "force-dynamic";

export default function NewCompanyPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Entreprise
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Creer une entreprise
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Ajoutez une entreprise pour rattacher vos offres et structurer le
            suivi des candidats.
          </p>
        </header>
        <CreateCompanyForm />
      </div>
    </div>
  );
}
