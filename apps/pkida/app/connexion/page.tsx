import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui";
import { getUser } from "@/lib/auth";
export const metadata = { title: "Connexion" };
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getUser()) redirect("/espace");
  const { error } = await searchParams;
  return (
    <main className="login-page">
      <aside className="login-aside">
        <Logo />
        <div>
          <span className="eyebrow">
            BIENVENUE DANS VOTRE PROCHAIN CHAPITRE
          </span>
          <h1>
            Moins de
            <br />
            recherche.
            <br />
            <em>Plus d’élan.</em>
          </h1>
          <p>Votre prochain poste commence par un espace qui vous ressemble.</p>
          <span className="login-star">✳</span>
        </div>
        <span>Votre recherche, vos règles.</span>
      </aside>
      <section className="login-main">
        <Link href="/" className="back-link">
          ← Retour à l’accueil
        </Link>
        <div className="login-box">
          <span className="eyebrow">FAISONS CONNAISSANCE</span>
          <h2>
            Votre prochaine
            <br />
            étape commence ici.
          </h2>
          <p>
            Connectez-vous pour créer votre profil et retrouver toutes vos
            candidatures.
          </p>
          {error && (
            <div className="notice error" role="alert">
              {error === "configuration"
                ? "Ce service de connexion n’est pas encore configuré. Les identifiants OAuth doivent être ajoutés par l’administrateur."
                : "La connexion n’a pas abouti ou a été annulée. Réessayez."}
            </div>
          )}
          {/* OAuth needs a full navigation, without Next.js prefetch. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="social-button" href="/api/auth/google">
            <span className="google-icon">G</span> Continuer avec Google{" "}
            <span>↗</span>
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="social-button" href="/api/auth/linkedin">
            <span className="linkedin-icon">in</span> Continuer avec LinkedIn{" "}
            <span>↗</span>
          </a>
          <div className="login-assurance">
            <span>◇</span>
            <p>
              Un seul compte pour votre recherche.
              <br />
              Aucune candidature envoyée sans paramétrage.
            </p>
          </div>
          {process.env.NODE_ENV !== "production" && (
            <form action="/api/auth/demo" method="post" className="demo-form">
              <button className="text-button">Explorer la démo locale →</button>
              <small>Réservé au développement, sans compte social.</small>
            </form>
          )}
        </div>
        <span className="login-bottom">
          Un peu moins d’administratif. Un peu plus d’avenir.
        </span>
      </section>
    </main>
  );
}
