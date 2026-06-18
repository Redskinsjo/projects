"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CompanyOption = {
  id: string;
  name: string;
};

type ImportedJobData = {
  companyId?: string;
  title?: string;
  description?: string;
  requiredSkills?: string;
};

function readLabeledLine(text: string, labels: string[]) {
  const escapedLabels = labels.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(
    `^\\s*(?:${escapedLabels.join("|")})\\s*[:\\-]\\s*(.+)$`,
    "im",
  );
  return text.match(pattern)?.[1]?.trim();
}

function readDescriptionBlock(text: string) {
  const match = text.match(
    /^\s*(?:description|missions?|contexte|profil)\s*[:\-]\s*([\s\S]+?)(?=^\s*(?:titre|poste|intitule|intitulé|entreprise|societe|société|competences|compétences|skills|prerequis|prérequis)\s*[:\-]|\s*$)/im,
  );
  return match?.[1]?.trim();
}

function findCompanyId(companyName: string | undefined, companies: CompanyOption[]) {
  if (!companyName) return undefined;
  const normalized = companyName.trim().toLocaleLowerCase("fr-FR");
  return companies.find(
    (company) => company.name.trim().toLocaleLowerCase("fr-FR") === normalized,
  )?.id;
}

function parseImportedJob(text: string, companies: CompanyOption[]): ImportedJobData {
  const title = readLabeledLine(text, ["titre", "poste", "intitule", "intitulé"]);
  const companyName = readLabeledLine(text, [
    "entreprise",
    "societe",
    "société",
    "company",
  ]);
  const requiredSkills = readLabeledLine(text, [
    "competences",
    "compétences",
    "skills",
    "prerequis",
    "prérequis",
  ]);
  const description = readDescriptionBlock(text) ?? text.trim();

  return {
    companyId: findCompanyId(companyName, companies),
    title,
    description,
    requiredSkills,
  };
}

export default function CreateJobForm({ companies }: { companies: CompanyOption[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");

  const importJobFile = async (file: File | undefined) => {
    setError("");
    setImportMessage("");

    if (!file) return;

    const text = await file.text();
    const cleanedText = text.replace(/\u0000/g, "").trim();

    if (cleanedText.length < 20) {
      setError(
        "Le fichier ne contient pas assez de texte lisible. Utilisez un fichier texte ou copiez le contenu dans la description.",
      );
      return;
    }

    const imported = parseImportedJob(cleanedText, companies);
    const applied: string[] = [];

    if (imported.companyId) {
      setCompanyId(imported.companyId);
      applied.push("entreprise");
    }

    if (imported.title) {
      setTitle(imported.title);
      applied.push("titre");
    }

    if (imported.requiredSkills) {
      setRequiredSkills(imported.requiredSkills);
      applied.push("competences");
    }

    if (imported.description) {
      setDescription(imported.description);
      applied.push("description");
    }

    setImportMessage(
      applied.length > 0
        ? `Fichier importe. Champs pre-remplis : ${applied.join(", ")}.`
        : "Fichier importe dans la description.",
    );
  };

  const submit = async (formData: FormData) => {
    setError("");
    formData.set("companyId", companyId);
    formData.set("title", title);
    formData.set("description", description);
    formData.set("requiredSkills", requiredSkills);

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
      <section className="mb-8 rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-5">
        <label className="block text-sm font-semibold text-slate-200">
          Importer une fiche de poste
        </label>
        <input
          type="file"
          accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json"
          onChange={(event) => importJobFile(event.target.files?.[0])}
          className="mt-4 block w-full text-sm text-slate-400 file:mr-4 file:rounded-3xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-300 hover:file:bg-slate-700"
        />
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Le fichier peut pre-remplir la description. Les lignes Titre:, Entreprise:
          et Competences: sont aussi reconnues si elles existent.
        </p>
        {importMessage ? (
          <p className="mt-3 text-sm text-emerald-300">{importMessage}</p>
        ) : null}
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Entreprise
          </label>
          <select
            name="companyId"
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
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
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
        rows={8}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      />
      <label className="mt-6 block text-sm font-semibold text-slate-300">
        Competences requises
      </label>
      <input
        name="requiredSkills"
        type="text"
        value={requiredSkills}
        onChange={(event) => setRequiredSkills(event.target.value)}
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
