import CandidateCard from "../components/CandidateCard";
import { getAllCandidates } from "../lib/server/candidateService";

export default async function SearchPage() {
  const candidates = await getAllCandidates();
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Recherche intelligente
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Trouvez rapidement le meilleur profil
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Utilisez notre moteur de recherche de talents pour filtrer par
            compétences, disponibilité et score de qualification.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-900/80 p-8 ring-1 ring-slate-700/50">
            <h2 className="text-xl font-semibold text-white">Filtres actifs</h2>
            <p className="mt-3 text-sm text-slate-400">
              Affinez par expérience, disponibilité et mots-clés métier.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="rounded-3xl bg-slate-950/95 p-4">
                Compétences : Vente, RH, Data
              </li>
              <li className="rounded-3xl bg-slate-950/95 p-4">
                Disponibilité : 2 semaines
              </li>
              <li className="rounded-3xl bg-slate-950/95 p-4">
                Score de qualification : 8/10
              </li>
            </ul>
          </div>
          <div className="rounded-3xl bg-slate-900/80 p-8 ring-1 ring-slate-700/50">
            <h2 className="text-xl font-semibold text-white">Résultats</h2>
            <p className="mt-3 text-sm text-slate-400">
              Parcourez les profils les plus pertinents, avec un aperçu
              instantané du match.
            </p>
            <div className="mt-6 space-y-4">
              {candidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
