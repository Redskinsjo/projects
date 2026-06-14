import Link from "next/link";
import { getCandidateById } from "@/app/lib/server/candidateService";

const channels = ["Email", "SMS", "WhatsApp", "Téléphone", "LinkedIn"];
const toneLevels = ["Direct", "Neutre", "Chaleureux", "Très empathique"];
const messageLengths = ["Très court", "Court", "Standard", "Détaillé"];
const detailLevels = ["Essentiel", "Intermédiaire", "Complet", "Très précis"];

const qualificationGoals = [
  "Disponibilité et préavis",
  "Motivations de changement",
  "Prétentions salariales",
  "Mobilité et rythme de travail",
  "Expérience sur les missions clés",
  "Compétences techniques prioritaires",
  "Niveau de séniorité réel",
  "Contraintes personnelles ou contractuelles",
  "Adéquation culturelle",
  "Autres opportunités en cours",
];

export default async function NewCandidateConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await getCandidateById(id);
  const candidateName = candidate?.name ?? "ce candidat";

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Qualification candidat
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Nouvelle conversation
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                Configurez la discussion avec {candidateName} pour recueillir
                les informations utiles au recruteur avant décision.
              </p>
            </div>
            <Link
              href={`/candidate/${id}`}
              className="inline-flex justify-center rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200"
            >
              Retour au profil
            </Link>
          </div>
        </header>

        <form className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <section className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
              <h2 className="text-2xl font-semibold text-white">
                Cadre de la conversation
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="conversation-name"
                    className="block text-sm font-semibold text-slate-300"
                  >
                    Nom
                  </label>
                  <input
                    id="conversation-name"
                    name="name"
                    type="text"
                    defaultValue={`Qualification ${candidateName}`}
                    className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="communication-channel"
                    className="block text-sm font-semibold text-slate-300"
                  >
                    Moyen de communication
                  </label>
                  <select
                    id="communication-channel"
                    name="channel"
                    defaultValue="Email"
                    className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    {channels.map((channel) => (
                      <option key={channel}>{channel}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <label
                  htmlFor="conversation-description"
                  className="block text-sm font-semibold text-slate-300"
                >
                  Description
                </label>
                <textarea
                  id="conversation-description"
                  name="description"
                  rows={5}
                  defaultValue={`Qualifier ${candidateName} sur son intérêt, ses contraintes et son adéquation avec le poste recherché.`}
                  className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
            </section>

            <section className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
              <h2 className="text-2xl font-semibold text-white">
                Objectifs de qualification
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {qualificationGoals.map((goal) => (
                  <label
                    key={goal}
                    className="flex items-center gap-3 rounded-3xl bg-slate-950/95 px-4 py-4 text-sm text-slate-300 ring-1 ring-slate-800/70"
                  >
                    <input
                      type="checkbox"
                      name="goals"
                      value={goal}
                      defaultChecked={[
                        "Disponibilité et préavis",
                        "Motivations de changement",
                        "Prétentions salariales",
                        "Expérience sur les missions clés",
                      ].includes(goal)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-cyan-400 focus:ring-cyan-400"
                    />
                    <span>{goal}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
              <h2 className="text-2xl font-semibold text-white">
                Style des messages
              </h2>
              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="tone-level"
                    className="block text-sm font-semibold text-slate-300"
                  >
                    Ton employé
                  </label>
                  <select
                    id="tone-level"
                    name="tone"
                    defaultValue="Chaleureux"
                    className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    {toneLevels.map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="message-length"
                    className="block text-sm font-semibold text-slate-300"
                  >
                    Longueur des messages
                  </label>
                  <select
                    id="message-length"
                    name="messageLength"
                    defaultValue="Court"
                    className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    {messageLengths.map((length) => (
                      <option key={length}>{length}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="detail-level"
                    className="block text-sm font-semibold text-slate-300"
                  >
                    Niveau de détails
                  </label>
                  <select
                    id="detail-level"
                    name="detailLevel"
                    defaultValue="Intermédiaire"
                    className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    {detailLevels.map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
              <h2 className="text-2xl font-semibold text-white">
                Questions imposées
              </h2>
              <label
                htmlFor="required-questions"
                className="mt-6 block text-sm font-semibold text-slate-300"
              >
                Questions libres à poser
              </label>
              <textarea
                id="required-questions"
                name="requiredQuestions"
                rows={8}
                placeholder={`Ex. Qu'est-ce qui vous ferait accepter ce poste ?\nQuelles missions voulez-vous éviter ?\nQuel est votre délai réel de disponibilité ?`}
                className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
              <button
                type="button"
                className="mt-6 w-full rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Enregistrer la configuration
              </button>
            </section>
          </aside>
        </form>
      </div>
    </div>
  );
}
