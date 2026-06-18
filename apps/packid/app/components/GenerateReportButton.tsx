"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GenerateReportButton({
  candidateId,
  disabled = false,
  disabledReason = "",
  label = "Generer le rapport",
}: {
  candidateId: string;
  disabled?: boolean;
  disabledReason?: string;
  label?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (disabled) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(payload?.error ?? "Impossible de generer le rapport.");
      }

      router.refresh();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Impossible de generer le rapport.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={generate}
        disabled={isLoading || disabled}
        className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {isLoading ? "Generation..." : label}
      </button>
      {disabled && disabledReason ? (
        <p className="mt-3 max-w-md text-sm leading-6 text-amber-200">
          {disabledReason}
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
