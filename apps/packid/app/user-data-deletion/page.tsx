import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "../lib/contact";

export const metadata: Metadata = {
  title: "Suppression de donnees utilisateur - Packid",
  description:
    "Instructions pour demander la suppression des donnees utilisateur traitees par Packid.",
};

export default function UserDataDeletionPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/85 p-8 shadow-2xl shadow-slate-950/30 sm:p-12">
        <Link
          href="/"
          className="text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          Retour a l&apos;accueil
        </Link>

        <header className="mt-8 border-b border-slate-800 pb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
            Packid
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Suppression de donnees utilisateur
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Derniere mise a jour : 20 juin 2026
          </p>
        </header>

        <div className="mt-10 space-y-9 text-sm leading-7 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white">
              Comment demander la suppression
            </h2>
            <p className="mt-3">
              Pour demander la suppression de vos donnees personnelles traitees
              par Packid, envoyez un email a{" "}
              <a
                href={CONTACT_MAILTO}
                className="font-medium text-emerald-300 hover:text-emerald-200"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              avec l&apos;objet &quot;Suppression de donnees Packid&quot;.
            </p>
            <p className="mt-3">
              Merci d&apos;indiquer l&apos;adresse email ou le numero de
              telephone associe a votre utilisation de Packid, ainsi que toute
              information permettant d&apos;identifier votre profil ou votre
              conversation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Donnees concernees
            </h2>
            <p className="mt-3">
              La demande peut concerner les informations de compte, les donnees
              candidat, les CV, les conversations, les reponses
              d&apos;entretien, les notifications WhatsApp ou email, ainsi que
              les donnees techniques associees a votre profil.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Traitement de la demande
            </h2>
            <p className="mt-3">
              Apres reception de votre demande, Packid verifiera les elements
              fournis et supprimera ou anonymisera les donnees concernees dans
              un delai raisonnable, sauf si leur conservation est necessaire
              pour respecter une obligation legale, resoudre un litige ou
              securiser le service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Donnees WhatsApp
            </h2>
            <p className="mt-3">
              Si vous avez recu ou envoye des messages via WhatsApp dans le
              cadre de Packid, vous pouvez demander la suppression des donnees
              que Packid controle, comme votre numero, les messages associes a
              votre conversation et les statuts de notification conserves par le
              service.
            </p>
            <p className="mt-3">
              Certaines donnees peuvent egalement etre traitees par Meta selon
              les conditions et politiques propres a WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Confirmation</h2>
            <p className="mt-3">
              Une confirmation vous sera envoyee lorsque la demande aura ete
              traitee. Si des donnees ne peuvent pas etre supprimees
              immediatement, nous vous indiquerons la raison et la duree de
              conservation applicable.
            </p>
          </section>

          <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
            <h2 className="text-xl font-semibold text-white">Contact direct</h2>
            <p className="mt-3">
              Email :{" "}
              <a
                href={CONTACT_MAILTO}
                className="font-medium text-emerald-200 hover:text-white"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
