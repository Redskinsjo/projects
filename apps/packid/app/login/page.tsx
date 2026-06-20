import AuthForm from "../components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto grid max-w-5xl gap-10 rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10 backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300 ring-1 ring-emerald-300/20">
            Authentification securisee
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Connectez-vous a votre espace recruteur
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Accedez a votre tableau de bord, aux entretiens IA et aux rapports
              de recrutement Packid.
            </p>
          </div>
        </div>
        <AuthForm mode="login" initialError={error} redirectTo={next} />
      </div>
    </div>
  );
}
