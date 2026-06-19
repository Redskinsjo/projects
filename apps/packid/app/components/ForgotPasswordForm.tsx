"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (formData: FormData) => {
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const body = (await response.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(body?.error ?? "Demande impossible.");
      return;
    }

    setMessage(
      body?.message ??
        "Si ce compte existe, un lien de reinitialisation vient d'etre envoye.",
    );
  };

  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-950/95 p-8 shadow-xl shadow-slate-950/20">
      <form action={submit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300">
            Email du compte
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="votre.email@exemple.com"
            className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 transition hover:from-emerald-300 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Envoi..." : "Recevoir un lien"}
        </button>

        {error ? (
          <div className="rounded-3xl bg-red-500/10 p-4 text-sm text-red-100 ring-1 ring-red-300/20">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="rounded-3xl bg-emerald-400/10 p-4 text-sm text-emerald-100 ring-1 ring-emerald-300/20">
            {message}
          </div>
        ) : null}
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        <Link
          href="/login"
          className="font-semibold text-emerald-300 hover:text-emerald-200"
        >
          Retour a la connexion
        </Link>
      </p>
    </div>
  );
}
