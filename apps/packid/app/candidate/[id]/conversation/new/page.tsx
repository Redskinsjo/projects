import Link from "next/link";
import { getCandidateById, getInterviewUrl } from "@/app/lib/server/recruitmentService";

export const dynamic = "force-dynamic";

export default async function NewCandidateConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await getCandidateById(id);
  const token = candidate?.invitationTokens[0]?.token;
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const interviewUrl = token ? getInterviewUrl(origin, token) : "";

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-slate-900/90 p-10 ring-1 ring-white/10">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Entretien Packid
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          L&apos;entretien se deroule dans Packid
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          La V2 remplace la configuration de messages par un lien d&apos;entretien
          securise. WhatsApp sert uniquement a envoyer l&apos;invitation.
        </p>
        {interviewUrl ? (
          <a
            href={interviewUrl}
            className="mt-8 inline-flex break-all rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950"
          >
            Ouvrir l&apos;entretien
          </a>
        ) : null}
        <Link
          href={`/candidate/${id}`}
          className="ml-0 mt-4 inline-flex rounded-3xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 sm:ml-3"
        >
          Retour au dossier
        </Link>
      </div>
    </div>
  );
}
