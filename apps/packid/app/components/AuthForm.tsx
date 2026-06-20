"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthMode = "login" | "signup";

const socialProviders = [
  { slug: "google", label: "Google", accent: "bg-white/90" },
  { slug: "microsoft", label: "Microsoft", accent: "bg-blue-500" },
  { slug: "apple", label: "Apple", accent: "bg-white" },
];

export default function AuthForm({
  mode,
  initialError = "",
  redirectTo = "/dashboard",
}: {
  mode: AuthMode;
  initialError?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = mode === "signup";

  const submit = async (formData: FormData) => {
    setError("");
    setIsSubmitting(true);

    const payload = Object.fromEntries(formData);
    const response = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as {
      error?: string;
      user?: {
        hasOrganization?: boolean;
      };
    } | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(body?.error ?? "Authentification impossible.");
      return;
    }

    const safeRedirectTo = redirectTo.startsWith("/") ? redirectTo : "/dashboard";
    const destination =
      body?.user?.hasOrganization === false ? "/organization/new" : safeRedirectTo;

    router.push(destination);
    router.refresh();
  };

  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-950/95 p-8 shadow-xl shadow-slate-950/20">
      <form action={submit} className="space-y-5">
        {isSignup ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Prenom
              </label>
              <input
                name="firstName"
                type="text"
                autoComplete="given-name"
                className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Nom
              </label>
              <input
                name="lastName"
                type="text"
                autoComplete="family-name"
                className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="votre.email@exemple.com"
            className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">
            Mot de passe
          </label>
          <input
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="••••••••••"
            className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
          {isSignup ? (
            <p className="mt-2 text-xs text-slate-500">
              Minimum 10 caracteres.
            </p>
          ) : null}
        </div>

        {!isSignup ? (
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Mot de passe oublie ?
            </Link>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 transition hover:from-emerald-300 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Traitement..."
            : isSignup
              ? "Creer le compte"
              : "Se connecter"}
        </button>

        {error ? (
          <div className="rounded-3xl bg-red-500/10 p-4 text-sm text-red-100 ring-1 ring-red-300/20">
            {error}
          </div>
        ) : null}
      </form>

      <div className="my-8 flex items-center gap-3 text-sm text-slate-500">
        <span className="h-px flex-1 bg-slate-700" />
        <span>Ou continuer avec</span>
        <span className="h-px flex-1 bg-slate-700" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {socialProviders.map((provider) => (
          <a
            key={provider.slug}
            href={`/api/auth/social/${provider.slug}`}
            className="flex items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-300"
          >
            <span className={`h-4 w-4 rounded-full ${provider.accent}`} />
            {provider.label}
          </a>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-slate-400">
        {isSignup ? "Vous avez deja un compte ?" : "Vous n'avez pas encore de compte ?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-emerald-300 hover:text-emerald-200"
        >
          {isSignup ? "Se connecter" : "Creer un compte"}
        </Link>
      </p>
    </div>
  );
}
