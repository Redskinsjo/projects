"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  role: "SYSTEM" | "ASSISTANT" | "USER";
  content: string;
};

type StartResponse = {
  candidate: {
    firstName: string;
    lastName: string;
    jobOffer: {
      title: string;
    };
  };
  conversation: {
    id: string;
    messages: Message[];
    completedAt?: string | null;
  };
};

export default function InterviewClient({ token }: { token: string }) {
  const [data, setData] = useState<StartResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetch("/api/interviews/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Invitation invalide ou expiree.");
        return response.json() as Promise<StartResponse>;
      })
      .then(setData)
      .catch((currentError) =>
        setError(
          currentError instanceof Error
            ? currentError.message
            : "Impossible de demarrer l'entretien.",
        ),
      );
  }, [token]);

  const sendAnswer = async () => {
    if (!data || !answer.trim() || isSending) return;

    setIsSending(true);
    setError("");

    try {
      const response = await fetch("/api/interviews/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: data.conversation.id,
          content: answer,
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible d'envoyer la reponse.");
      }

      const conversation = (await response.json()) as StartResponse["conversation"];
      setData({ ...data, conversation });
      setAnswer("");
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Impossible d'envoyer la reponse.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleAnswerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    void sendAnswer();
  };

  if (error && !data) {
    return (
      <div className="rounded-[2rem] bg-slate-900/90 p-10 text-center ring-1 ring-white/10">
        <h1 className="text-3xl font-semibold text-white">Entretien indisponible</h1>
        <p className="mt-4 text-sm text-slate-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[2rem] bg-slate-900/90 p-10 text-center ring-1 ring-white/10">
        <p className="text-sm text-slate-300">Demarrage de l&apos;entretien...</p>
      </div>
    );
  }

  const visibleMessages = data.conversation.messages.filter(
    (message) => message.role !== "SYSTEM",
  );
  const isCompleted = Boolean(data.conversation.completedAt);

  return (
    <div className="rounded-[2rem] bg-slate-900/90 p-8 ring-1 ring-white/10">
      <div className="border-b border-slate-800 pb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          Entretien IA Packid
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          {data.candidate.jobOffer.title}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {data.candidate.firstName} {data.candidate.lastName}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {visibleMessages.map((message) => (
          <div
            key={message.id}
            className={`rounded-3xl p-5 text-sm leading-6 ring-1 ${
              message.role === "USER"
                ? "bg-cyan-500/10 text-cyan-50 ring-cyan-300/20"
                : "bg-slate-950/95 text-slate-200 ring-slate-800/70"
            }`}
          >
            <p className="mb-2 text-xs uppercase tracking-[0.2em] opacity-70">
              {message.role === "USER" ? "Votre reponse" : "Packid"}
            </p>
            {message.content}
          </div>
        ))}
      </div>

      {isCompleted ? (
        <div className="mt-6 rounded-3xl bg-emerald-500/10 p-5 text-sm text-emerald-100 ring-1 ring-emerald-300/20">
          Entretien termine. Le recruteur peut maintenant generer le rapport.
        </div>
      ) : (
        <div className="mt-6">
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={handleAnswerKeyDown}
            rows={5}
            className="w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
          <button
            type="button"
            onClick={sendAnswer}
            disabled={isSending}
            className="mt-4 rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isSending ? "Envoi..." : "Envoyer"}
          </button>
          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
