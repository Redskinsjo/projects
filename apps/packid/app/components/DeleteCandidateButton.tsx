"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCandidateButton({
  candidateId,
  candidateName,
  redirectTo,
}: {
  candidateId: string;
  candidateName: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const deleteCandidate = async () => {
    setIsDeleting(true);
    setError("");

    const response = await fetch(`/api/candidate/${candidateId}`, {
      method: "DELETE",
    });
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    setIsDeleting(false);

    if (!response.ok) {
      setError(body?.error ?? "Impossible de supprimer le candidat.");
      return;
    }

    setIsOpen(false);
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/15"
      >
        Supprimer
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-candidate-${candidateId}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-slate-950/50">
            <h2
              id={`delete-candidate-${candidateId}`}
              className="text-xl font-semibold text-white"
            >
              Supprimer ce candidat ?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Cette action supprimera definitivement le dossier de {candidateName},
              ainsi que ses invitations, conversations et rapports associes.
            </p>
            {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setError("");
                }}
                disabled={isDeleting}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={deleteCandidate}
                disabled={isDeleting}
                className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Suppression..." : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
