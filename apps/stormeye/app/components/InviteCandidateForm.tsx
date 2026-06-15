"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const channelLabels = {
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
  EMAIL: "Email",
};

export default function InviteCandidateForm({
  candidateId,
  hasEmail,
  hasPhone,
}: {
  candidateId: string;
  hasEmail: boolean;
  hasPhone: boolean;
}) {
  const router = useRouter();
  const [communicationChannel, setCommunicationChannel] = useState("WHATSAPP");
  const [error, setError] = useState("");
  const [interviewUrl, setInterviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unavailable =
    (communicationChannel === "EMAIL" && !hasEmail) ||
    ((communicationChannel === "WHATSAPP" || communicationChannel === "SMS") &&
      !hasPhone);

  const submit = async (formData: FormData) => {
    setError("");
    setInterviewUrl("");
    setIsSubmitting(true);

    const response = await fetch(`/api/candidate/${candidateId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        communicationChannel: formData.get("communicationChannel"),
      }),
    });
    const body = (await response.json().catch(() => null)) as {
      error?: string;
      interviewUrl?: string;
    } | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(body?.error ?? "Impossible d'avertir le candidat.");
      return;
    }

    setInterviewUrl(body?.interviewUrl ?? "");
    router.refresh();
  };

  return (
    <form action={submit} className="mt-6 rounded-3xl bg-slate-950/95 p-4 ring-1 ring-slate-800/70">
      <label className="block text-sm font-semibold text-slate-200">
        Avertir le candidat
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <select
          name="communicationChannel"
          value={communicationChannel}
          onChange={(event) => setCommunicationChannel(event.target.value)}
          className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        >
          <option value="WHATSAPP">WhatsApp</option>
          <option value="SMS">SMS</option>
          <option value="EMAIL">Email</option>
        </select>
        <button
          disabled={isSubmitting || unavailable}
          className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Envoi..." : `Avertir par ${channelLabels[communicationChannel as keyof typeof channelLabels]}`}
        </button>
      </div>
      {unavailable ? (
        <p className="mt-3 text-xs text-amber-200">
          Les coordonnees necessaires pour ce canal ne sont pas renseignees.
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {interviewUrl ? (
        <p className="mt-3 break-all text-sm text-emerald-200">
          Invitation preparee : {interviewUrl}
        </p>
      ) : null}
    </form>
  );
}
