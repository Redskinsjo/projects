"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  composeInternationalPhoneNumber,
  COUNTRY_DIAL_CODES,
  DEFAULT_COUNTRY_DIAL_CODE,
  splitInternationalPhoneNumber,
} from "../lib/phone";

type JobOption = {
  id: string;
  title: string;
  company: {
    name: string;
  };
};

type ImportedCandidateData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  resumeUrl?: string;
  jobOfferId?: string;
};

type DeliveryStatus = "PENDING" | "SENT" | "FAILED" | "SIMULATED";

type DeliveryNotice = {
  status: DeliveryStatus;
  message?: string | null;
} | null;

export default function CreateCandidateForm({ jobs }: { jobs: JobOption[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [clipboardText, setClipboardText] = useState("");
  const [interviewUrl, setInterviewUrl] = useState("");
  const [deliveryNotice, setDeliveryNotice] = useState<DeliveryNotice>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState(
    DEFAULT_COUNTRY_DIAL_CODE,
  );
  const [resumeUrl, setResumeUrl] = useState("");
  const [jobOfferId, setJobOfferId] = useState(jobs[0]?.id ?? "");
  const [invitationMode, setInvitationMode] = useState<"create" | "createAndNotify">(
    "create",
  );
  const [communicationChannel, setCommunicationChannel] = useState("WHATSAPP");

  const applyImportedCandidate = (imported: ImportedCandidateData) => {
    const applied: string[] = [];

    if (imported.firstName) {
      setFirstName(imported.firstName);
      applied.push("prenom");
    }

    if (imported.lastName) {
      setLastName(imported.lastName);
      applied.push("nom");
    }

    if (imported.email) {
      setEmail(imported.email);
      applied.push("email");
    }

    if (imported.phoneNumber) {
      const parsedPhoneNumber = splitInternationalPhoneNumber(
        imported.phoneNumber,
      );
      setPhoneCountryCode(parsedPhoneNumber.countryDialCode);
      setPhoneNumber(parsedPhoneNumber.nationalNumber);
      applied.push("telephone");
    }

    if (imported.resumeUrl) {
      setResumeUrl(imported.resumeUrl);
      applied.push("lien CV");
    }

    if (imported.jobOfferId) {
      setJobOfferId(imported.jobOfferId);
      applied.push("offre");
    }

    setImportMessage(
      applied.length
        ? `Informations importees : ${applied.join(", ")}.`
        : "Aucune information reconnue automatiquement.",
    );
  };

  const importCandidateData = async (input: { file?: File; text?: string }) => {
    setError("");
    setImportMessage("");
    setIsImporting(true);

    const formData = new FormData();
    if (input.file) formData.append("file", input.file);
    if (input.text) formData.append("text", input.text);

    const response = await fetch("/api/candidates/import", {
      method: "POST",
      body: formData,
    });
    const body = (await response.json().catch(() => null)) as {
      imported?: ImportedCandidateData;
      error?: string;
    } | null;

    setIsImporting(false);

    if (!response.ok || !body?.imported) {
      setError(body?.error ?? "Import des informations candidat impossible.");
      return;
    }

    applyImportedCandidate(body.imported);
  };

  const importClipboard = async () => {
    if (clipboardText.trim()) {
      await importCandidateData({ text: clipboardText });
      return;
    }

    if (!navigator.clipboard?.readText) {
      setError("Lecture du presse-papier indisponible dans ce navigateur.");
      return;
    }

    const text = await navigator.clipboard.readText();
    setClipboardText(text);
    await importCandidateData({ text });
  };

  const submit = async (formData: FormData) => {
    setError("");
    setInterviewUrl("");
    setDeliveryNotice(null);
    formData.set("firstName", firstName);
    formData.set("lastName", lastName);
    formData.set("email", email);
    formData.set(
      "phoneNumber",
      composeInternationalPhoneNumber(phoneNumber, phoneCountryCode),
    );
    formData.set("phoneCountryCode", phoneCountryCode);
    formData.set("resumeUrl", resumeUrl);
    formData.set("jobOfferId", jobOfferId);
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
      invitation?: {
        deliveryStatus?: DeliveryStatus;
        deliveryMessage?: string | null;
      } | null;
    } | null;

    if (!response.ok) {
      setError(body?.error ?? "Impossible de creer le candidat.");
      return;
    }

    setInterviewUrl(body?.interviewUrl ?? "");
    setDeliveryNotice(
      body?.invitation?.deliveryStatus
        ? {
            status: body.invitation.deliveryStatus,
            message: body.invitation.deliveryMessage,
          }
        : null,
    );
    router.refresh();
  };

  return (
    <form action={submit} className="rounded-3xl bg-slate-900/80 p-8 ring-1 ring-slate-700/50">
      <section className="mb-8 rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-5">
        <label className="block text-sm font-semibold text-slate-200">
          Importer les informations candidat
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.rtf,.txt,.md,.csv,.json,.html,.htm,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/plain,text/markdown,text/csv,text/html,application/json"
          disabled={isImporting}
          onChange={(event) =>
            importCandidateData({ file: event.target.files?.[0] })
          }
          className="mt-4 block w-full text-sm text-slate-400 file:mr-4 file:rounded-3xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-300 hover:file:bg-slate-700"
        />

        <label className="mt-5 block text-sm font-semibold text-slate-300">
          Coller des donnees clé-valeur
        </label>
        <textarea
          value={clipboardText}
          onChange={(event) => setClipboardText(event.target.value)}
          rows={5}
          placeholder={"prenom: Marie\nnom=Durand\nemail,marie@exemple.com\ntelephone:+33612345678"}
          className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
        <button
          type="button"
          disabled={isImporting}
          onClick={importClipboard}
          className="mt-3 rounded-3xl border border-slate-700 px-5 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {clipboardText.trim()
            ? "Remplir depuis le texte"
            : "Lire le presse-papier"}
        </button>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Formats acceptes : PDF, DOCX, RTF et fichiers texte. Les lignes
          clé:valeur, clé=valeur, clé,valeur, tabulations et points-virgules
          sont reconnues.
        </p>
        {isImporting ? (
          <p className="mt-3 text-sm text-cyan-300">Analyse des informations...</p>
        ) : null}
        {importMessage ? (
          <p className="mt-3 text-sm text-emerald-300">{importMessage}</p>
        ) : null}
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Prenom
          </label>
          <input
            name="firstName"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
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
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300">
            Telephone WhatsApp
          </label>
          <div className="mt-2 flex gap-2">
            <select
              name="phoneCountryCode"
              value={phoneCountryCode}
              onChange={(event) => setPhoneCountryCode(event.target.value)}
              className="w-20 shrink-0 rounded-3xl border border-slate-800 bg-slate-950/95 px-2 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 sm:w-24"
            >
              {COUNTRY_DIAL_CODES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code}
                </option>
              ))}
            </select>
            <input
              name="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="6 12 34 56 78"
              className="min-w-0 flex-1 rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Le numero sera enregistre avec l&apos;indicatif pour WhatsApp.
          </p>
        </div>
      </div>
      <label className="mt-6 block text-sm font-semibold text-slate-300">
        Offre
      </label>
      <select
        name="jobOfferId"
        value={jobOfferId}
        onChange={(event) => setJobOfferId(event.target.value)}
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
        value={resumeUrl}
        onChange={(event) => setResumeUrl(event.target.value)}
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
      {deliveryNotice ? (
        <div
          className={`mt-4 rounded-3xl p-4 text-sm ring-1 ${
            deliveryNotice.status === "FAILED"
              ? "bg-red-500/10 text-red-100 ring-red-300/20"
              : deliveryNotice.status === "SIMULATED"
                ? "bg-amber-500/10 text-amber-100 ring-amber-300/20"
                : "bg-emerald-500/10 text-emerald-100 ring-emerald-300/20"
          }`}
        >
          Statut WhatsApp : {deliveryNotice.status}
          {deliveryNotice.message ? (
            <span className="mt-2 block break-words">
              {deliveryNotice.message}
            </span>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
