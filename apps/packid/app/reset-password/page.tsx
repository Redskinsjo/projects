import ResetPasswordForm from "../components/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto flex max-w-xl flex-col justify-center">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Packid
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Nouveau mot de passe
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Choisissez un nouveau mot de passe pour retrouver acces a votre compte.
          </p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </main>
  );
}
