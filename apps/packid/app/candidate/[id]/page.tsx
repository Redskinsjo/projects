import Link from "next/link";
import ArchiveCandidateButton from "@/app/components/ArchiveCandidateButton";
import CandidateEditableFields from "@/app/components/CandidateEditableFields";
import DeleteCandidateButton from "@/app/components/DeleteCandidateButton";
import GenerateReportButton from "@/app/components/GenerateReportButton";
import InviteCandidateForm from "@/app/components/InviteCandidateForm";
import { getCandidateById, getInterviewUrl } from "@/app/lib/server/recruitmentService";

export const dynamic = "force-dynamic";

function asStringList(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Non renseigne";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await getCandidateById(id);

  if (!candidate) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-slate-900/90 p-12 text-center ring-1 ring-white/10">
          <h1 className="text-3xl font-semibold text-white">
            Candidat introuvable
          </h1>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950"
          >
            Retour dashboard
          </Link>
        </div>
      </div>
    );
  }

  const latestReport = candidate.reports[0];
  const latestToken = candidate.invitationTokens[0];
  const latestConversation = candidate.conversations[0];
  const hasResume = Boolean(candidate.resumeUrl?.trim());
  const hasStartedConversation = Boolean(
    latestConversation?.messages.some((message) => message.role === "USER"),
  );
  const canGenerateReport = hasResume || hasStartedConversation;
  const reportDisabledReason = canGenerateReport
    ? ""
    : "Ajoutez un CV ou collectez au moins une reponse du candidat avant de generer un rapport.";
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const interviewUrl = latestToken ? getInterviewUrl(origin, latestToken.token) : "";
  const skills = asStringList(candidate.jobOffer.requiredSkills);
  const isArchived = Boolean(candidate.archivedAt);
  const candidateName = `${candidate.firstName} ${candidate.lastName}`;

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Dossier candidat
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                {candidateName}
              </h1>
              <p className="mt-3 text-lg text-slate-300">
                {candidate.jobOffer.title} · {candidate.jobOffer.company.name}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                {candidate.status}
              </span>
              {isArchived ? (
                <span className="rounded-full bg-amber-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Archive
                </span>
              ) : null}
              {typeof candidate.score === "number" ? (
                <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  {candidate.score}/100
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-800 pt-6">
            <ArchiveCandidateButton
              candidateId={candidate.id}
              isArchived={isArchived}
            />
            {isArchived ? (
              <DeleteCandidateButton
                candidateId={candidate.id}
                candidateName={candidateName}
                redirectTo="/search?archived=archived"
              />
            ) : null}
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <CandidateEditableFields candidate={candidate} />

            <section className="rounded-[2rem] bg-slate-900/90 p-8 ring-1 ring-white/10">
              <h2 className="text-2xl font-semibold text-white">Invitation</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                {interviewUrl ? (
                  <div className="rounded-3xl bg-slate-950/95 p-4 ring-1 ring-slate-800/70">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Lien entretien
                    </p>
                    <a
                      href={interviewUrl}
                      className="mt-2 block break-all text-cyan-300 hover:text-cyan-200"
                    >
                      {interviewUrl}
                    </a>
                    <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                      <p>Canal : {latestToken.channel ?? "Non renseigne"}</p>
                      <p>Statut : {latestToken.deliveryStatus ?? "Non renseigne"}</p>
                      <p>Envoye le : {formatDate(latestToken.sentAt)}</p>
                      <p>Expire le : {formatDate(latestToken.expiresAt)}</p>
                    </div>
                  </div>
                ) : null}
                <InviteCandidateForm
                  candidateId={candidate.id}
                  hasEmail={Boolean(candidate.email)}
                  hasPhone={Boolean(candidate.phoneNumber)}
                />
              </div>
            </section>
          </div>

          <section className="rounded-[2rem] bg-slate-900/90 p-8 ring-1 ring-white/10">
            <h2 className="text-2xl font-semibold text-white">Offre</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {candidate.jobOffer.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-[2rem] bg-slate-900/90 p-8 ring-1 ring-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Rapport de recrutement
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Synthese, forces, faiblesses, niveau estime, score et
                recommandation.
              </p>
            </div>
            <GenerateReportButton
              candidateId={candidate.id}
              disabled={!canGenerateReport}
              disabledReason={reportDisabledReason}
              label={latestReport ? "Regenerer le rapport" : "Generer le rapport"}
            />
          </div>

          {latestReport ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-3xl bg-slate-950/95 p-6 ring-1 ring-slate-800/70">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Resume
                </p>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-200">
                  {latestReport.summary}
                </p>
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl bg-emerald-500/10 p-5 ring-1 ring-emerald-300/20">
                  <p className="text-sm text-emerald-200">Score</p>
                  <p className="mt-2 text-4xl font-semibold text-white">
                    {latestReport.score}/100
                  </p>
                  <p className="mt-2 text-sm text-emerald-100">
                    {latestReport.recommendation} · {latestReport.estimatedLevel}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/95 p-5 ring-1 ring-slate-800/70">
                  <p className="font-semibold text-white">Forces</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {asStringList(latestReport.strengths).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl bg-slate-950/95 p-5 ring-1 ring-slate-800/70">
                  <p className="font-semibold text-white">Faiblesses</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {asStringList(latestReport.weaknesses).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-6 rounded-3xl bg-slate-950/95 p-6 text-sm text-slate-400">
              Aucun rapport genere pour le moment.
            </p>
          )}
        </section>

        <section className="rounded-[2rem] bg-slate-900/90 p-8 ring-1 ring-white/10">
          <h2 className="text-2xl font-semibold text-white">Conversation</h2>
          <div className="mt-6 space-y-4">
            {latestConversation?.messages.map((message) => (
              <div
                key={message.id}
                className="rounded-3xl bg-slate-950/95 p-5 ring-1 ring-slate-800/70"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {message.role}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {message.content}
                </p>
              </div>
            )) ?? (
              <p className="rounded-3xl bg-slate-950/95 p-6 text-sm text-slate-400">
                Entretien non demarre.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
