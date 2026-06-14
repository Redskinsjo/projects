"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { fetchCandidateById } from "../../lib/client/candidateApi";
import type { Candidate } from "@/app/generated/prisma/client";
import { CandidatesHistoryitem } from "@/app/lib/types";

function isCandidateHistoryItem(value: unknown): value is CandidatesHistoryitem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.company === "string" &&
    typeof entry.role === "string" &&
    typeof entry.status === "string" &&
    typeof entry.period === "string"
  );
}

export default function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [candidate, setCandidate] = useState<null | Candidate>(null);

  const history = Array.isArray(candidate?.history)
    ? candidate.history.filter(isCandidateHistoryItem)
    : [];

  useEffect(() => {
    fetchCandidateById(id)
      .then(setCandidate)
      .catch(() => setCandidate(null));
  }, [id]);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([
    "Besoin de confirmation sur la disponibilité.",
    "Conversation bien engagée avec l’équipe opérationnelle.",
  ]);
  const [qualification, setQualification] = useState({
    senior: false,
    junior: false,
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState("");
  const [jobFileName, setJobFileName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [matchSummary, setMatchSummary] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [isPreparingAnalysis, setIsPreparingAnalysis] = useState(false);

  if (!candidate) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-slate-900/90 p-12 text-center shadow-2xl shadow-slate-950/40 ring-1 ring-white/10">
          <h1 className="text-3xl font-semibold text-white">
            Candidat introuvable
          </h1>
          <p className="mt-4 text-sm text-slate-400">
            Le profil demandé n’existe pas ou contient une erreur dans
            l’identifiant.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const addComment = () => {
    if (!comment.trim()) return;
    setComments((current) => [comment.trim(), ...current]);
    setComment("");
  };

  const downloadAnalysisFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const getDownloadedFileName = (response: Response) => {
    const disposition = response.headers.get("Content-Disposition");
    const match = disposition?.match(/filename="([^"]+)"/);

    return match?.[1] ?? `analyse-cv-${candidate.id}.txt`;
  };

  const prepareMatchAnalysis = async () => {
    const role = targetRole.trim() || candidate.role;

    setAnalysisError("");
    setMatchSummary("");

    if (!cvFile) {
      setAnalysisError("Ajoutez le CV du candidat avant de préparer l'analyse.");
      return;
    }

    if (!jobFile && !role) {
      setAnalysisError("Ajoutez une fiche de poste ou renseignez un nom de poste.");
      return;
    }

    const formData = new FormData();
    formData.append("cv", cvFile);

    if (jobFile) {
      formData.append("fichePoste", jobFile);
    } else {
      formData.append("nomPoste", role);
    }

    setIsPreparingAnalysis(true);

    try {
      const response = await fetch(`/api/candidate/${candidate.id}/analyse`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(error?.error ?? "Impossible de préparer l'analyse.");
      }

      const blob = await response.blob();
      downloadAnalysisFile(blob, getDownloadedFileName(response));
      setMatchSummary("Analyse prête. Le fichier a été téléchargé.");
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Impossible de préparer l'analyse.",
      );
    } finally {
      setIsPreparingAnalysis(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-emerald-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300 ring-1 ring-emerald-300/20">
                  Vue 360 candidat
                </span>
                <span className="rounded-full bg-slate-800 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {candidate.personalAvailability}
                </span>
                <span className="rounded-full bg-slate-800 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {candidate.personalExperience}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  {candidate.name}
                </h1>
                <p className="mt-3 text-lg text-slate-300">{candidate.role}</p>
              </div>
            </div>
            <Link
              href="/search"
              className="inline-flex rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Retour à la recherche
            </Link>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-300">
            {candidate.personalSummary}
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-8">
            <section className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
              <h2 className="text-2xl font-semibold text-white">
                Identité & contact
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/95 p-6 ring-1 ring-slate-800/60">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Email
                  </p>
                  <p className="mt-2 text-sm text-slate-100">
                    {candidate.personalEmail}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/95 p-6 ring-1 ring-slate-800/60">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Téléphone
                  </p>
                  <p className="mt-2 text-sm text-slate-100">
                    {candidate.personalPhone}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/95 p-6 ring-1 ring-slate-800/60">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Localisation
                  </p>
                  <p className="mt-2 text-sm text-slate-100">
                    {candidate.personalLocation}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/95 p-6 ring-1 ring-slate-800/60">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    CV
                  </p>
                  <a
                    href={candidate.cvLink}
                    className="mt-2 inline-flex text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    Voir le CV
                  </a>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Analyse de correspondance
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Importez le CV et le poste recherché pour préparer les
                    écarts, forces et questions de qualification.
                  </p>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Matching IA
                </span>
              </div>
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <label className="block rounded-3xl border border-dashed border-slate-700 bg-slate-950/95 p-5 text-sm text-slate-300 transition hover:border-cyan-400/70">
                  <span className="block font-semibold text-white">
                    CV du candidat
                  </span>
                  <span className="mt-2 block text-slate-500">
                    Fichier PDF.
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setCvFile(file);
                      setCvFileName(file?.name ?? "");
                    }}
                    className="mt-4 block w-full text-sm text-slate-400 file:mr-4 file:rounded-3xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-300 hover:file:bg-slate-700"
                  />
                  {cvFileName ? (
                    <span className="mt-3 block text-cyan-300">
                      {cvFileName}
                    </span>
                  ) : null}
                </label>
                <label className="block rounded-3xl border border-dashed border-slate-700 bg-slate-950/95 p-5 text-sm text-slate-300 transition hover:border-cyan-400/70">
                  <span className="block font-semibold text-white">
                    Poste recherché
                  </span>
                  <span className="mt-2 block text-slate-500">
                    Fiche de poste ou brief recruteur en PDF.
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setJobFile(file);
                      setJobFileName(file?.name ?? "");
                    }}
                    className="mt-4 block w-full text-sm text-slate-400 file:mr-4 file:rounded-3xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-300 hover:file:bg-slate-700"
                  />
                  {jobFileName ? (
                    <span className="mt-3 block text-cyan-300">
                      {jobFileName}
                    </span>
                  ) : null}
                </label>
              </div>
              <div className="mt-5">
                <label className="block text-sm font-semibold text-slate-300">
                  Intitulé ou contexte du poste
                </label>
                <textarea
                  rows={4}
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  placeholder="Ex. Head of Talent Acquisition, équipe de 8 personnes, contexte scale-up..."
                  className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={prepareMatchAnalysis}
                  disabled={isPreparingAnalysis}
                  className="inline-flex justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {isPreparingAnalysis ? "Analyse en cours..." : "Préparer l’analyse"}
                </button>
                <Link
                  href={`/candidate/${candidate.id}/conversation/new`}
                  className="inline-flex justify-center rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200"
                >
                  Configurer une conversation
                </Link>
              </div>
              {matchSummary ? (
                <div className="mt-6 rounded-3xl bg-cyan-500/10 p-5 text-sm leading-6 text-cyan-100 ring-1 ring-cyan-300/20">
                  {matchSummary}
                </div>
              ) : null}
              {analysisError ? (
                <div className="mt-6 rounded-3xl bg-red-500/10 p-5 text-sm leading-6 text-red-100 ring-1 ring-red-300/20">
                  {analysisError}
                </div>
              ) : null}
            </section>

            <section className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Conversation en cours
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Mots clés qui traduisent le contexte actuel du dialogue.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  {candidate.conversation}
                </span>
              </div>
              <Link
                href={`/candidate/${candidate.id}/conversation/new`}
                className="mt-5 inline-flex rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Nouvelle qualification
              </Link>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {candidate.conversationKeywords.map((keyword) => (
                  <div
                    key={keyword}
                    className="rounded-3xl bg-slate-950/95 p-4 ring-1 ring-slate-800/60"
                  >
                    <p className="text-sm font-semibold text-white">
                      {keyword}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
              <h2 className="text-2xl font-semibold text-white">
                Historique des candidatures
              </h2>
              <div className="mt-6 space-y-4">
                {history.map((entry) => (
                  <div
                    key={entry.company}
                    className="rounded-3xl bg-slate-950/95 p-5 ring-1 ring-slate-800/60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-white">
                          {entry.company}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {entry.role}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                        {entry.period}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      Statut : {entry.status}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
              <h2 className="text-2xl font-semibold text-white">
                Qualification équipe
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Sélectionnez le niveau le plus pertinent pour partager le statut
                avec votre équipe.
              </p>
              <div className="mt-6 space-y-4">
                <label className="flex items-center gap-3 rounded-3xl bg-slate-950/95 px-4 py-4 text-sm text-slate-300 ring-1 ring-slate-800/70">
                  <input
                    type="checkbox"
                    checked={qualification.senior}
                    onChange={() =>
                      setQualification((value) => ({
                        ...value,
                        senior: !value.senior,
                      }))
                    }
                    className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span>Senior</span>
                </label>
                <label className="flex items-center gap-3 rounded-3xl bg-slate-950/95 px-4 py-4 text-sm text-slate-300 ring-1 ring-slate-800/70">
                  <input
                    type="checkbox"
                    checked={qualification.junior}
                    onChange={() =>
                      setQualification((value) => ({
                        ...value,
                        junior: !value.junior,
                      }))
                    }
                    className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span>Junior</span>
                </label>
              </div>
              <div className="mt-6 rounded-3xl bg-slate-950/95 p-4 text-sm text-slate-300 ring-1 ring-slate-800/70">
                <p className="font-semibold text-white">Statut actuel</p>
                <p className="mt-2">
                  {qualification.senior
                    ? "Senior"
                    : qualification.junior
                      ? "Junior"
                      : "Aucun niveau sélectionné"}
                </p>
              </div>
            </section>

            <section className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Commentaires
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Ajoutez des notes pour l’équipe et retrouvez l’historique
                    des idées.
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  placeholder="Écrire un commentaire..."
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
                <button
                  type="button"
                  onClick={addComment}
                  className="inline-flex rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Ajouter le commentaire
                </button>
              </div>
              <div className="mt-6 space-y-3">
                {comments.map((entry, index) => (
                  <div
                    key={`${entry}-${index}`}
                    className="rounded-3xl bg-slate-950/95 p-4 ring-1 ring-slate-800/60 text-sm text-slate-300"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
