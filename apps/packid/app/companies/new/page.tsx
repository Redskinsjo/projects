import CreateCompanyForm from "@/app/components/CreateCompanyForm";

export const dynamic = "force-dynamic";

export default function NewCompanyPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-[2rem] bg-slate-900/90 p-10 ring-1 ring-white/10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Entreprise
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Creer une entreprise
          </h1>
        </header>
        <CreateCompanyForm />
      </div>
    </div>
  );
}
