"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCompanyForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const submit = async (formData: FormData) => {
    setError("");
    const response = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formData.get("name") }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(body?.error ?? "Impossible de creer l'entreprise.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form
      action={submit}
      className="rounded-lg border border-slate-800 bg-slate-900/70 p-6"
    >
      <label className="block text-sm font-semibold text-slate-300">
        Nom de l&apos;entreprise
      </label>
      <input
        name="name"
        type="text"
        placeholder="Acme Talent"
        className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      />
      <button className="mt-6 rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
        Creer l&apos;entreprise
      </button>
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
