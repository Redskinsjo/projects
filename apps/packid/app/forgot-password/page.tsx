import ForgotPasswordForm from "../components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto flex max-w-xl flex-col justify-center">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Packid
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Mot de passe oublie
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Entrez votre email pour recevoir un lien de reinitialisation.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
