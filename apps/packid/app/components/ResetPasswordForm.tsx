"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (formData: FormData) => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: formData.get("password"),
      }),
    });
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(body?.error ?? "Reinitialisation impossible.");
      return;
    }

    setSuccess("Mot de passe reinitialise. Vous pouvez vous reconnecter.");
    router.refresh();
  };

  if (!token) {
    return (
      <div className="rounded-[2rem] border border-red-300/20 bg-red-500/10 p-8 text-sm text-red-100">
        Lien de reinitialisation manquant.
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-950/95 p-8 shadow-xl shadow-slate-950/20">
      <form action={submit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300">
            Nouveau mot de passe
          </label>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
          <p className="mt-2 text-xs text-slate-500">Minimum 10 caracteres.</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || Boolean(success)}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 transition hover:from-emerald-300 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Reinitialisation..." : "Enregistrer le mot de passe"}
        </button>

        {error ? (
          <div className="rounded-3xl bg-red-500/10 p-4 text-sm text-red-100 ring-1 ring-red-300/20">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-3xl bg-emerald-400/10 p-4 text-sm text-emerald-100 ring-1 ring-emerald-300/20">
            {success}
          </div>
        ) : null}
      </form>

      {success ? (
        <p className="mt-8 text-center text-sm text-slate-400">
          <Link
            href="/login"
            className="font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Aller a la connexion
          </Link>
        </p>
      ) : null}
    </div>
  );
}
