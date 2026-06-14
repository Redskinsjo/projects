import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 sm:px-10 flex items-center justify-center">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300 ring-1 ring-emerald-300/20">
              Authentification sécurisée
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Connectez-vous à votre espace recruteur
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Accédez à votre tableau de bord de recrutement, suivez les
                candidats et pilotez votre sourcing depuis une interface
                unifiée.
              </p>
            </div>
            <div className="grid gap-4 rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700/50">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Rester connecté
              </p>
              <p className="text-sm leading-6 text-slate-300">
                Vous n’avez pas encore de compte ?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  Créez-en un dès maintenant
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/95 p-8 shadow-xl shadow-slate-950/20">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-300"
                >
                  Nom d’utilisateur
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="votre.email@exemple.com"
                  className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <Link
                  href="/forgot-password"
                  className="font-medium text-emerald-300 hover:text-emerald-200"
                >
                  Mot de passe oublié ?
                </Link>
                <Link
                  href="/signup"
                  className="font-medium text-emerald-300 hover:text-emerald-200"
                >
                  Créer un compte
                </Link>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 transition hover:from-emerald-300 hover:to-cyan-300"
              >
                Se connecter
              </Link>
            </form>

            <div className="my-8 flex items-center gap-3 text-sm text-slate-500">
              <span className="h-px flex-1 bg-slate-700"></span>
              <span>Ou connectez-vous avec</span>
              <span className="h-px flex-1 bg-slate-700"></span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button className="flex items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-300">
                <span className="h-4 w-4 rounded-full bg-white/90"></span>
                Google
              </button>
              <button className="flex items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-500 hover:text-blue-300">
                <span className="h-4 w-4 rounded-full bg-blue-500"></span>
                Microsoft
              </button>
              <button className="flex items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-200 hover:text-slate-100">
                <span className="h-4 w-4 rounded-full bg-white"></span>
                Apple
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
