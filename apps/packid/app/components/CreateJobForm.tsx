"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CompanyOption = {
  id: string;
  name: string;
};

type ImportedJobData = {
  companyId?: string;
  companyName?: string;
  title?: string;
  description?: string;
  requiredSkills?: string;
};

export default function CreateJobForm({ companies }: { companies: CompanyOption[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [clipboardText, setClipboardText] = useState("");
  const [companyName, setCompanyName] = useState(companies[0]?.name ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const findCompanyByName = (name: string) =>
    companies.find(
      (company) =>
        company.name.trim().toLocaleLowerCase("fr-FR") ===
        name.trim().toLocaleLowerCase("fr-FR"),
    );

  const applyImportedJob = (imported: ImportedJobData) => {
    const applied: string[] = [];

    if (imported.companyName) {
      setCompanyName(imported.companyName);
      applied.push("entreprise");
    } else if (imported.companyId) {
      const company = companies.find((option) => option.id === imported.companyId);
      if (company) {
        setCompanyName(company.name);
        applied.push("entreprise");
      }
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
        ? `Donnees importees : ${applied.join(", ")}.`
        : "Aucune information reconnue automatiquement.",
    );
  };

  const importJobData = async (input: { file?: File; text?: string }) => {
    setError("");
    setImportMessage("");

    if (!input.file && !input.text?.trim()) return;

    setIsImporting(true);

    const formData = new FormData();
    if (input.file) formData.append("file", input.file);
    if (input.text) formData.append("text", input.text);

    const response = await fetch("/api/jobs/import", {
      method: "POST",
      body: formData,
    });
    const body = (await response.json().catch(() => null)) as {
      imported?: ImportedJobData;
      error?: string;
    } | null;

    setIsImporting(false);

    if (!response.ok || !body?.imported) {
      setError(body?.error ?? "Lecture du fichier impossible.");
      return;
    }

    applyImportedJob(body.imported);
  };

  const importClipboard = async () => {
    if (clipboardText.trim()) {
      await importJobData({ text: clipboardText });
      return;
    }

    if (!navigator.clipboard?.readText) {
      setError("Lecture du presse-papier indisponible dans ce navigateur.");
      return;
    }

    const text = await navigator.clipboard.readText();
    setClipboardText(text);
    await importJobData({ text });
  };

  const submit = async (formData: FormData) => {
    setError("");
    const matchedCompany = findCompanyByName(companyName);
    formData.set("companyId", matchedCompany?.id ?? "");
    formData.set("companyName", companyName);
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
    <form action={submit} className="rounded-lg bg-slate-900/70 p-8 border border-slate-800">
      <section className="mb-8 rounded-lg border border-dashed border-slate-700 bg-slate-950/80 p-5">
        <label className="block text-sm font-semibold text-slate-200">
          Importer une fiche de poste
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.rtf,.txt,.md,.csv,.json,.html,.htm,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/plain,text/markdown,text/csv,text/html,application/json"
          disabled={isImporting}
          onChange={(event) => importJobData({ file: event.target.files?.[0] })}
          className="mt-4 block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-300 hover:file:bg-slate-700"
        />

        <label className="mt-5 block text-sm font-semibold text-slate-300">
          Coller une offre en clé-valeur
        </label>
        <textarea
          value={clipboardText}
          onChange={(event) => setClipboardText(event.target.value)}
          rows={5}
          placeholder={"entreprise: NovaStudio Digital\ntitre=Designer UI/UX Senior\ncompetences,Figma, UI/UX, HTML, CSS\ndescription: ..."}
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
        <button
          type="button"
          disabled={isImporting}
          onClick={importClipboard}
          className="mt-3 rounded-lg border border-slate-700 px-5 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {clipboardText.trim()
            ? "Remplir depuis le texte"
            : "Lire le presse-papier"}
        </button>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Formats acceptes : PDF, DOCX, RTF et fichiers texte. Les lignes
          clé:valeur, clé=valeur, clé,valeur, tabulations et points-virgules
          sont aussi reconnues.
        </p>
        {isImporting ? (
          <p className="mt-3 text-sm text-cyan-300">Analyse du fichier...</p>
        ) : null}
        {importMessage ? (
          <p className="mt-3 text-sm text-emerald-300">{importMessage}</p>
        ) : null}
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Entreprise
          </label>
          <input
            name="companyName"
            type="text"
            list="job-company-options"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="NovaStudio Digital"
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
          <datalist id="job-company-options">
            {companies.map((company) => (
              <option key={company.id} value={company.name} />
            ))}
          </datalist>
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
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
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
        className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
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
        className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      />
      <button className="mt-8 rounded-lg bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
        Creer l&apos;offre
      </button>
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
