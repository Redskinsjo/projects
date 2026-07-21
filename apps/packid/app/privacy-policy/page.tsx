import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "../lib/contact";

export const metadata: Metadata = {
  title: "Politique de confidentialite - Packid",
  description:
    "Politique de confidentialite de Packid pour les utilisateurs et les communications WhatsApp.",
};

export default function PrivacyPolicyPage() {
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
            Politique de confidentialite
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Derniere mise a jour : 20 juin 2026
          </p>
        </header>

        <div className="mt-10 space-y-9 text-sm leading-7 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white">
              1. Responsable du traitement
            </h2>
            <p className="mt-3">
              Packid fournit une application d&apos;assistance au recrutement
              permettant aux recruteurs de gerer des candidats, des offres
              d&apos;emploi, des conversations et des notifications, notamment
              via WhatsApp Cloud API.
            </p>
            <p className="mt-3">
              Pour toute question relative a cette politique, vous pouvez nous
              contacter a l&apos;adresse suivante :{" "}
              <a
                href={CONTACT_MAILTO}
                className="font-medium text-emerald-300 hover:text-emerald-200"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Donnees collectees
            </h2>
            <p className="mt-3">
              Selon votre utilisation du service, Packid peut traiter les
              donnees suivantes : nom, prenom, adresse email, numero de
              telephone, informations de profil candidat, CV, historique de
              conversation, reponses d&apos;entretien, donnees liees aux offres
              d&apos;emploi et informations techniques necessaires a la securite
              du service.
            </p>
            <p className="mt-3">
              Lorsque WhatsApp est utilise, Packid peut traiter le numero de
              telephone, le contenu des messages envoyes ou recus, les statuts
              de livraison et les identifiants techniques fournis par Meta afin
              d&apos;acheminer les notifications et de suivre leur bon
              fonctionnement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              3. Finalites d&apos;utilisation
            </h2>
            <p className="mt-3">
              Les donnees sont utilisees pour creer et administrer les comptes,
              gerer les candidats et les offres, faciliter les conversations de
              recrutement, envoyer des notifications, ameliorer la qualite du
              service, securiser l&apos;application et respecter les obligations
              legales applicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              4. Partage des donnees
            </h2>
            <p className="mt-3">
              Packid ne vend pas les donnees personnelles. Les donnees peuvent
              etre partagees avec des prestataires techniques strictement
              necessaires au fonctionnement du service, comme
              l&apos;hebergement, la base de donnees, l&apos;envoi d&apos;emails
              ou la messagerie WhatsApp Cloud API fournie par Meta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              5. Conservation
            </h2>
            <p className="mt-3">
              Les donnees sont conservees pendant la duree necessaire a la
              fourniture du service, a la gestion de la relation contractuelle,
              a la securite de l&apos;application et au respect des obligations
              legales. Les donnees peuvent etre supprimees sur demande lorsque
              la loi le permet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Securite</h2>
            <p className="mt-3">
              Packid met en place des mesures techniques et organisationnelles
              raisonnables pour proteger les donnees contre l&apos;acces non
              autorise, la perte, l&apos;alteration ou la divulgation
              accidentelle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              7. Droits des utilisateurs
            </h2>
            <p className="mt-3">
              Selon la reglementation applicable, vous pouvez demander
              l&apos;acces, la rectification, la suppression, la limitation ou
              l&apos;opposition au traitement de vos donnees. Vous pouvez
              exercer ces droits en nous contactant a{" "}
              <a
                href={CONTACT_MAILTO}
                className="font-medium text-emerald-300 hover:text-emerald-200"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              8. Suppression des donnees
            </h2>
            <p className="mt-3">
              Les instructions de suppression sont disponibles sur la page{" "}
              <Link
                href="/user-data-deletion"
                className="font-medium text-emerald-300 hover:text-emerald-200"
              >
                Suppression de donnees utilisateur
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
