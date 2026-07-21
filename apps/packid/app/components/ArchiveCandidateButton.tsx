"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ArchiveCandidateButton({
  candidateId,
  isArchived,
}: {
  candidateId: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleArchive = async () => {
    setIsSubmitting(true);
    setError("");

    const response = await fetch(`/api/candidate/${candidateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !isArchived }),
    });

    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(
        body?.error ??
          (isArchived
            ? "Impossible de restaurer le candidat."
            : "Impossible d'archiver le candidat."),
      );
      return;
    }

    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        onClick={toggleArchive}
        disabled={isSubmitting}
        className={`inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isArchived
            ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
            : "border border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15"
        }`}
      >
        {isSubmitting
          ? "Traitement..."
          : isArchived
            ? "Restaurer"
            : "Archiver"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
