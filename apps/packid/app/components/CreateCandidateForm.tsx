"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type JobOption = {
  id: string;
  title: string;
  company: {
    name: string;
  };
};

export default function CreateCandidateForm({ jobs }: { jobs: JobOption[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [interviewUrl, setInterviewUrl] = useState("");
  const [invitationMode, setInvitationMode] = useState<"create" | "createAndNotify">(
    "create",
  );
  const [communicationChannel, setCommunicationChannel] = useState("WHATSAPP");

  const submit = async (formData: FormData) => {
    setError("");
    setInterviewUrl("");
    formData.set("invitationMode", invitationMode);
    if (invitationMode === "createAndNotify") {
      formData.set("communicationChannel", communicationChannel);
    } else {
      formData.delete("communicationChannel");
    }

    const response = await fetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    const body = (await response.json().catch(() => null)) as {
      error?: string;
      interviewUrl?: string;
      candidate?: { id: string };
    } | null;

    if (!response.ok) {
      setError(body?.error ?? "Impossible de creer le candidat.");
      return;
    }

    setInterviewUrl(body?.interviewUrl ?? "");
    router.refresh();
  };

  return (
    <form action={submit} className="rounded-3xl bg-slate-900/80 p-8 ring-1 ring-slate-700/50">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Prenom
          </label>
          <input
            name="firstName"
            type="text"
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Nom
          </label>
          <input
            name="lastName"
            type="text"
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Email
          </label>
          <input
            name="email"
            type="email"
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Telephone WhatsApp
          </label>
          <input
            name="phoneNumber"
            type="tel"
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
      </div>
      <label className="mt-6 block text-sm font-semibold text-slate-300">
        Offre
      </label>
      <select
        name="jobOfferId"
        className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      >
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>
            {job.title} · {job.company.name}
          </option>
        ))}
      </select>
      <label className="mt-6 block text-sm font-semibold text-slate-300">
        Lien CV
      </label>
      <input
        name="resumeUrl"
        type="url"
        placeholder="https://..."
        className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      />

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
        <p className="text-sm font-semibold text-slate-200">
          Action apres creation
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4 transition hover:border-cyan-400">
            <input
              type="radio"
              name="candidateCreationChoice"
              value="create"
              checked={invitationMode === "create"}
              onChange={() => setInvitationMode("create")}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-semibold text-white">
                Creer le candidat
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-400">
                Le dossier est cree sans avertir le candidat.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4 transition hover:border-cyan-400">
            <input
              type="radio"
              name="candidateCreationChoice"
              value="createAndNotify"
              checked={invitationMode === "createAndNotify"}
              onChange={() => setInvitationMode("createAndNotify")}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-semibold text-white">
                Creer et avertir
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-400">
                Une invitation est envoyee avec le lien d&apos;entretien.
              </span>
            </span>
          </label>
        </div>

        {invitationMode === "createAndNotify" ? (
          <div className="mt-5">
            <label className="block text-sm font-semibold text-slate-300">
              Canal de communication
            </label>
            <select
              value={communicationChannel}
              onChange={(event) => setCommunicationChannel(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            >
              <option value="WHATSAPP">WhatsApp</option>
              <option value="SMS">SMS</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>
        ) : null}
      </div>

      <button className="mt-8 rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
        {invitationMode === "createAndNotify"
          ? "Creer et avertir"
          : "Creer le candidat"}
      </button>
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {interviewUrl ? (
        <div className="mt-6 rounded-3xl bg-emerald-500/10 p-4 text-sm text-emerald-100 ring-1 ring-emerald-300/20">
          Invitation preparee : {interviewUrl}
        </div>
      ) : null}
    </form>
  );
}
