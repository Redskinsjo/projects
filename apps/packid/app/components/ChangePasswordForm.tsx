"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (formData: FormData) => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const payload = Object.fromEntries(formData);
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(body?.error ?? "Modification impossible.");
      return;
    }

    setSuccess("Mot de passe modifie.");
  };

  return (
    <form action={submit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300">
          Mot de passe actuel
        </label>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300">
          Nouveau mot de passe
        </label>
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
        <p className="mt-2 text-xs text-slate-500">Minimum 10 caracteres.</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Modification..." : "Modifier le mot de passe"}
      </button>

      {error ? (
        <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-100 ring-1 ring-red-300/20">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg bg-emerald-400/10 p-4 text-sm text-emerald-100 ring-1 ring-emerald-300/20">
          {success}
        </div>
      ) : null}
    </form>
  );
}
