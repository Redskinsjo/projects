"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type CandidateEditableFieldsProps = {
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    resumeUrl: string | null;
  };
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function CandidateEditableFields({
  candidate,
}: CandidateEditableFieldsProps) {
  const router = useRouter();
  const didMount = useRef(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [fields, setFields] = useState({
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email ?? "",
    phoneNumber: candidate.phoneNumber ?? "",
    resumeUrl: candidate.resumeUrl ?? "",
  });

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    setSaveState("saving");
    setError("");

    const timeout = window.setTimeout(async () => {
      const response = await fetch(`/api/candidate/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setSaveState("error");
        setError(body?.error ?? "Impossible de mettre a jour le candidat.");
        return;
      }

      setSaveState("saved");
      router.refresh();
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [candidate.id, fields, router]);

  const updateField = (field: keyof typeof fields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="rounded-[2rem] bg-slate-900/90 p-8 ring-1 ring-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Candidat</h2>
          <p className="mt-2 text-sm text-slate-400">
            Les modifications sont enregistrees automatiquement.
          </p>
        </div>
        <p className="text-sm text-slate-400">
          {saveState === "saving"
            ? "Enregistrement..."
            : saveState === "saved"
              ? "Modifications enregistrees"
              : saveState === "error"
                ? "Erreur d'enregistrement"
                : ""}
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Prenom
          </label>
          <input
            type="text"
            value={fields.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Nom
          </label>
          <input
            type="text"
            value={fields.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Email
          </label>
          <input
            type="email"
            value={fields.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="email@exemple.com"
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            WhatsApp
          </label>
          <input
            type="tel"
            value={fields.phoneNumber}
            onChange={(event) => updateField("phoneNumber", event.target.value)}
            placeholder="+33..."
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-sm font-semibold text-slate-300">
          Lien CV
        </label>
        <input
          type="url"
          value={fields.resumeUrl}
          onChange={(event) => updateField("resumeUrl", event.target.value)}
          placeholder="https://..."
          className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
    </section>
  );
}
