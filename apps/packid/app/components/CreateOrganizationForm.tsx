"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function CreateOrganizationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedName = useMemo(() => name.trim(), [name]);
  const canSubmit =
    Boolean(trimmedName) &&
    !availabilityError &&
    !isCheckingAvailability &&
    !isSubmitting;

  useEffect(() => {
    if (!trimmedName) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsCheckingAvailability(true);

      try {
        const response = await fetch(
          `/api/organization?name=${encodeURIComponent(trimmedName)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const body = (await response.json().catch(() => null)) as {
          available?: boolean;
        } | null;

        if (!response.ok || body?.available === false) {
          setAvailabilityError("Ce nom d'organisation est deja utilise.");
          return;
        }

        setAvailabilityError("");
      } catch {
        if (!controller.signal.aborted) {
          setAvailabilityError(
            "Impossible de verifier ce nom pour le moment.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCheckingAvailability(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [trimmedName]);

  const submit = async (formData: FormData) => {
    if (!canSubmit) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/organization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formData.get("name") }),
    });
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(body?.error ?? "Impossible de creer l'organisation.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form
      action={submit}
      className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10"
    >
      <label className="block text-sm font-semibold text-slate-300">
        Nouvelle organisation
      </label>
      <input
        name="name"
        type="text"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setError("");
          setAvailabilityError("");
        }}
        placeholder="Acme Recrutement"
        aria-invalid={Boolean(availabilityError)}
        className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      />
      {isCheckingAvailability ? (
        <p className="mt-3 text-sm text-slate-400">Verification du nom...</p>
      ) : null}
      {availabilityError ? (
        <p className="mt-3 text-sm text-red-300">{availabilityError}</p>
      ) : null}
      <button
        disabled={!canSubmit}
        className="mt-6 rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creation..." : "Suivant"}
      </button>
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
