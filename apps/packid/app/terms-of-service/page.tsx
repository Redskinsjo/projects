import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions de service - Packid",
  description:
    "Conditions de service applicables a l'utilisation de Packid.",
};

export default function TermsOfServicePage() {
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
            Conditions de service
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Derniere mise a jour : 20 juin 2026
          </p>
        </header>

        <div className="mt-10 space-y-9 text-sm leading-7 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white">
              1. Objet du service
            </h2>
            <p className="mt-3">
              Packid est une application d&apos;assistance au recrutement. Elle
              permet aux utilisateurs autorises de gerer des offres
              d&apos;emploi, des candidats, des conversations, des rapports et
              des notifications de recrutement, notamment par email ou WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Acces et compte utilisateur
            </h2>
            <p className="mt-3">
              L&apos;utilisation de certaines fonctionnalites necessite un compte.
              L&apos;utilisateur s&apos;engage a fournir des informations exactes,
              a proteger ses identifiants et a signaler toute utilisation non
              autorisee de son compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              3. Utilisation acceptable
            </h2>
            <p className="mt-3">
              L&apos;utilisateur s&apos;engage a utiliser Packid uniquement dans un
              cadre legal et professionnel. Il est interdit d&apos;utiliser le
              service pour envoyer des contenus illicites, trompeurs,
              discriminatoires, abusifs, non sollicites ou contraires aux
              politiques applicables des services tiers connectes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              4. Communications WhatsApp et email
            </h2>
            <p className="mt-3">
              Lorsque Packid permet l&apos;envoi de notifications via WhatsApp,
              email ou tout autre canal, l&apos;utilisateur doit s&apos;assurer qu&apos;il
              dispose d&apos;une base legale ou d&apos;un consentement approprie pour
              contacter les destinataires. L&apos;utilisation de WhatsApp reste
              soumise aux conditions et politiques de Meta et WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              5. Donnees et confidentialite
            </h2>
            <p className="mt-3">
              Le traitement des donnees personnelles est decrit dans la{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-emerald-300 hover:text-emerald-200"
              >
                Politique de confidentialite
              </Link>
              . Les instructions relatives a la suppression sont disponibles sur
              la page{" "}
              <Link
                href="/user-data-deletion"
                className="font-medium text-emerald-300 hover:text-emerald-200"
              >
                Suppression de donnees utilisateur
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              6. Disponibilite du service
            </h2>
            <p className="mt-3">
              Packid s&apos;efforce de fournir un service fiable, mais ne garantit
              pas une disponibilite continue, sans interruption ni erreur. Des
              maintenances, evolutions ou incidents techniques peuvent affecter
              temporairement l&apos;acces au service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              7. Responsabilite
            </h2>
            <p className="mt-3">
              Packid fournit des outils d&apos;assistance a la decision. Les
              recruteurs et organisations utilisatrices restent responsables de
              leurs decisions de recrutement, de leurs communications et du
              respect des lois applicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              8. Contact
            </h2>
            <p className="mt-3">
              Pour toute question relative aux conditions de service, contactez{" "}
              <a
                href="mailto:contact@recrutopia.ai"
                className="font-medium text-emerald-300 hover:text-emerald-200"
              >
                contact@recrutopia.ai
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
