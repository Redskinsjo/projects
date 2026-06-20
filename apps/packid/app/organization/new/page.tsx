import CreateOrganizationForm from "@/app/components/CreateOrganizationForm";

export const dynamic = "force-dynamic";

export default function NewOrganizationPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <header className="mx-auto mb-8 flex max-w-6xl justify-end">
        <a
          href="/logout"
          className="rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-red-300 hover:bg-red-500/10 hover:text-red-100"
        >
          Deconnexion
        </a>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <section className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Bienvenue sur Packid
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Gagnez du temps sur chaque recrutement.
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <p>
              Packid aide votre organisation a centraliser ses offres, ses
              candidats, ses entretiens et ses rapports dans un espace unique.
              L&apos;objectif est simple : reduire les taches repetitives,
              accelerer la qualification des profils et garder une vue claire
              sur les decisions a prendre.
            </p>
            <p>
              Votre organisation servira de frontiere de securite : les offres,
              candidats, scores, conversations et invitations crees ici ne
              seront visibles que par les utilisateurs rattaches a cette meme
              organisation.
            </p>
            <p>
              Nous demarrons par la creation de votre organisation. Les etapes
              suivantes permettront ensuite de preciser votre contexte de
              recrutement, vos equipes et vos canaux de communication.
            </p>
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Demarrage
            </p>
            <p className="mt-3 text-sm leading-6 text-cyan-50">
              Creation d&apos;une organisation pour rattacher vos donnees et
              ouvrir l&apos;acces au tableau de bord.
            </p>
          </div>
          <CreateOrganizationForm />
        </section>
      </div>
    </div>
  );
}
