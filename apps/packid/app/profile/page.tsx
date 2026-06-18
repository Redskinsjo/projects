import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/server/authService";

const providerLabels = {
  GOOGLE: "Google",
  MICROSOFT: "Microsoft",
  APPLE: "Apple",
};

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Non renseigne";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function initials(firstName?: string | null, lastName?: string | null, email?: string) {
  const letters = [firstName?.[0], lastName?.[0]].filter(Boolean).join("");
  return (letters || email?.slice(0, 2) || "SE").toUpperCase();
}

function maskIdentifier(value: string) {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function rawProfileKeys(rawProfile: unknown) {
  if (!rawProfile || typeof rawProfile !== "object" || Array.isArray(rawProfile)) {
    return [];
  }

  return Object.keys(rawProfile).slice(0, 8);
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?error=Connectez-vous pour acceder a votre profil.");
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const hasPassword = Boolean(user.passwordCredential);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-emerald-400 text-2xl font-semibold text-slate-950 shadow-lg shadow-emerald-400/20">
                {initials(user.firstName, user.lastName, user.email)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase text-emerald-300">
                  Profil recruteur
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                  {fullName || user.email}
                </h1>
                <p className="mt-2 break-words text-sm text-slate-300">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:min-w-80">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-slate-500">Compte cree</p>
                <p className="mt-1 font-medium text-slate-100">
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-slate-500">Derniere mise a jour</p>
                <p className="mt-1 font-medium text-slate-100">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-lg font-semibold text-white">
              Informations connues
            </h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <dt className="text-slate-500">Prenom</dt>
                <dd className="text-right text-slate-100">
                  {user.firstName || "Non renseigne"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <dt className="text-slate-500">Nom</dt>
                <dd className="text-right text-slate-100">
                  {user.lastName || "Non renseigne"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <dt className="text-slate-500">Email verifie</dt>
                <dd className="text-right text-slate-100">
                  {user.emailVerifiedAt
                    ? formatDate(user.emailVerifiedAt)
                    : "Pas encore verifie"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">Avatar provider</dt>
                <dd className="max-w-64 break-words text-right text-slate-100">
                  {user.avatarUrl || "Non disponible"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">
                Methodes de connexion
              </h2>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-300/20">
                {user.oauthAccounts.length + (hasPassword ? 1 : 0)} active(s)
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-100">
                      Email et mot de passe
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {hasPassword ? "Configure" : "Non configure"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      hasPassword
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {hasPassword ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>

              {user.oauthAccounts.map((account) => {
                const keys = rawProfileKeys(account.rawProfile);

                return (
                  <div
                    key={account.id}
                    className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-100">
                          {providerLabels[account.provider]}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Lie le {formatDate(account.createdAt)}
                        </p>
                      </div>
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                        Social login
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-slate-500">Email provider</dt>
                        <dd className="mt-1 break-words text-slate-100">
                          {account.email || "Non fourni"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Nom affiche</dt>
                        <dd className="mt-1 text-slate-100">
                          {account.displayName ||
                            [account.firstName, account.lastName]
                              .filter(Boolean)
                              .join(" ") ||
                            "Non fourni"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Identifiant provider</dt>
                        <dd className="mt-1 font-mono text-xs text-slate-100">
                          {maskIdentifier(account.providerAccountId)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Synchronise</dt>
                        <dd className="mt-1 text-slate-100">
                          {formatDate(account.updatedAt)}
                        </dd>
                      </div>
                    </dl>

                    {keys.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {keys.map((key) => (
                          <span
                            key={key}
                            className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-lg font-semibold text-white">Sessions recentes</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {user.sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-sm"
              >
                <p className="font-medium text-slate-100">
                  Session ouverte le {formatDate(session.createdAt)}
                </p>
                <p className="mt-1 text-slate-500">
                  Expire le {formatDate(session.expiresAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
