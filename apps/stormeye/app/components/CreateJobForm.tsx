"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CompanyOption = {
  id: string;
  name: string;
};

export default function CreateJobForm({ companies }: { companies: CompanyOption[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  const submit = async (formData: FormData) => {
    setError("");
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(body?.error ?? "Impossible de creer l'offre.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form action={submit} className="rounded-3xl bg-slate-900/80 p-8 ring-1 ring-slate-700/50">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Entreprise
          </label>
          <select
            name="companyId"
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Titre
          </label>
          <input
            name="title"
            type="text"
            placeholder="Account Executive"
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
      </div>
      <label className="mt-6 block text-sm font-semibold text-slate-300">
        Description
      </label>
      <textarea
        name="description"
        rows={6}
        className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      />
      <label className="mt-6 block text-sm font-semibold text-slate-300">
        Competences requises
      </label>
      <input
        name="requiredSkills"
        type="text"
        placeholder="React, PostgreSQL, discovery client"
        className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      />
      <button className="mt-8 rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
        Creer l&apos;offre
      </button>
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
