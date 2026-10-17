"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RunSearchButton({ researchId, status }: { researchId: string; status: "Préparée" | "Active" | "En pause" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/campaigns/${researchId}/run`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "La recherche a échoué.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La recherche a échoué.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus() {
    setStatusBusy(true);
    setError("");
    try {
      const nextStatus = status === "En pause" ? "ACTIVE" : "PAUSED";
      const response = await fetch(`/api/campaigns/${researchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Impossible de modifier cette recherche.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de modifier cette recherche.");
    } finally {
      setStatusBusy(false);
    }
  }

  return (
    <div>
      <button className="button" type="button" onClick={run} disabled={busy}>
        {busy ? "Recherche sur le web…" : "Lancer la recherche"}
      </button>
      {status !== "Préparée" ? <button className="button secondary" type="button" onClick={toggleStatus} disabled={statusBusy}>{statusBusy ? "Mise à jour…" : status === "Active" ? "Mettre en pause" : "Reprendre la recherche"}</button> : null}
      {error ? <p role="alert" className="panel-description">{error}</p> : null}
    </div>
  );
}
