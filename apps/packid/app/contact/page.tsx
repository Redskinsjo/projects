import Link from "next/link";
import ContactForm from "../components/ContactForm";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border-b border-slate-800 pb-6">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
          >
            Retour a l&apos;accueil
          </Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Contact
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Parlez-nous de votre besoin recrutement.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Remplissez le formulaire et votre message sera transmis directement
            a l&apos;adresse de contact configuree pour Packid.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold text-white">
              Ce que vous pouvez demander
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-400">
              <p>Decouverte de Packid pour votre equipe.</p>
              <p>Configuration WhatsApp, email ou connecteurs RH.</p>
              <p>Questions sur les offres, les candidats ou les entretiens IA.</p>
            </div>
          </aside>
          <ContactForm />
        </section>
      </div>
    </main>
  );
}
