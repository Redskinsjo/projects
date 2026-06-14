export default function AddCandidatePage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Ajouter un candidat
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Nouvelle fiche talent
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Renseignez un profil, joignez le CV et lancez le suivi de
            qualification.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900/80 p-8 ring-1 ring-slate-700/50">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-300">
                Nom complet
              </label>
              <input
                type="text"
                placeholder="Jean Dupont"
                className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300">
                Poste souhaité
              </label>
              <input
                type="text"
                placeholder="Responsable Talent"
                className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-300">
                Compétences clés
              </label>
              <input
                type="text"
                placeholder="RH, recrutement, communication"
                className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300">
                Disponibilité
              </label>
              <select className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20">
                <option>Immédiate</option>
                <option>2 semaines</option>
                <option>1 mois</option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-semibold text-slate-300">
              CV
            </label>
            <div className="mt-2 rounded-3xl border border-dashed border-slate-800 bg-slate-950/95 p-6 text-sm text-slate-400">
              Glissez-déposez le CV ici ou cliquez pour sélectionner un fichier.
            </div>
          </div>
          <button className="mt-8 rounded-3xl bg-cyan-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Enregistrer le candidat
          </button>
        </div>
      </div>
    </div>
  );
}
