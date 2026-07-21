"use client";

import { useState } from "react";

export default function ContactForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (formData: FormData) => {
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/contact", {
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
      setError(body?.error ?? "Impossible d'envoyer le message.");
      return;
    }

    setMessage(body?.message ?? "Votre message a bien ete envoye.");
  };

  return (
    <form
      action={submit}
      className="rounded-lg border border-slate-800 bg-slate-900/80 p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="firstName" label="Prenom" autoComplete="given-name" />
        <Field name="lastName" label="Nom" autoComplete="family-name" />
        <Field name="companyName" label="Nom de l'entreprise" />
        <Field name="companySector" label="Secteur de l'entreprise" />
        <Field name="email" label="Email" type="email" autoComplete="email" />
        <Field name="phoneNumber" label="Numero de telephone" type="tel" />
      </div>

      <label className="mt-5 block text-sm font-semibold text-slate-300">
        Message
      </label>
      <textarea
        name="message"
        required
        rows={7}
        className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Envoi..." : "Envoyer le message"}
      </button>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {message ? (
        <p className="mt-4 rounded-lg bg-emerald-400/10 p-4 text-sm text-emerald-100 ring-1 ring-emerald-300/20">
          {message}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      />
    </div>
  );
}
