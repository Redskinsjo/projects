import Link from "next/link";
import { Arrow, Logo } from "@/components/ui";
export default function Home() {
  return (
    <>
      <header className="container nav marketing-nav">
        <Logo />
        <nav aria-label="Navigation principale">
          <a className="desktop-link" href="#comment-ca-marche">
            Comment ça marche
          </a>
          <Link href="/connexion">Se connecter</Link>
          <Link className="button button-small" href="/connexion">
            Trouver mon prochain job <Arrow />
          </Link>
        </nav>
      </header>
      <main>
        <section className="container hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" /> VOTRE TALENT MÉRITE MIEUX QUE DES
              FORMULAIRES
            </div>
            <h1>
              Votre prochain job.
              <br />
              Sans y passer
              <br />
              <span className="highlight">vos journées.</span>
              <span className="hero-spark">✳</span>
            </h1>
            <p className="lead">
              Moins de candidatures à répétition.
              <br />
              Plus de place pour votre prochain chapitre.
            </p>
            <p className="hero-description">
              Définissez ce que vous cherchez. Rassemblez votre profil et vos
              candidatures. Préparez une recherche qui travaille à votre rythme.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/connexion">
                Prendre une longueur d’avance <Arrow />
              </Link>
              <span>Votre recherche, vos règles.</span>
            </div>
            <div className="hero-proof">
              <span className="mini-check">✓</span> Un profil unique{" "}
              <span className="mini-check">✓</span> Tout au même endroit{" "}
              <span className="mini-check">✓</span> Vous gardez la main
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Aperçu illustratif du futur espace de candidature"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="art-spark">✳</span>
            <div className="float-label">
              <span>✦</span> La suite commence ici.
            </div>
            <div className="preview-card">
              <div className="preview-top">
                <span className="eyebrow">VOTRE NOUVEAU DÉPART</span>
                <span className="dots">•••</span>
              </div>
              <div className="preview-avatar">
                C<span>↗</span>
              </div>
              <h3>Un job qui vous ressemble.</h3>
              <p>Et une recherche qui vous laisse respirer.</p>
              <div className="preview-chips">
                <span>Product designer</span>
                <span>Paris · Hybride</span>
              </div>
              <div className="preview-line">
                <span className="icon-square">⌕</span>
                <div>
                  <strong>Vos envies, bien définies</strong>
                  <small>Poste, lieu, salaire et rythme</small>
                </div>
                <span className="round-check">✓</span>
              </div>
              <div className="preview-line">
                <span className="icon-square">▤</span>
                <div>
                  <strong>Votre profil, prêt à partir</strong>
                  <small>Un CV. Toutes vos opportunités.</small>
                </div>
                <span className="round-check">✓</span>
              </div>
              <div className="preview-bottom">
                <span>Place aux bonnes opportunités</span>
                <span>↗</span>
              </div>
            </div>
            <div className="floating-note">
              <span className="note-icon">↗</span>
              <div>
                <strong>Moins de répétition.</strong>
                <span>Plus de projection.</span>
              </div>
            </div>
            <span className="art-caption">
              APERÇU DU PARCOURS · DONNÉES ILLUSTRATIVES
            </span>
          </div>
        </section>
        <section className="benefit-strip">
          <div className="container">
            <span>Votre énergie est précieuse.</span>
            <strong>Gardez-la pour les entretiens.</strong>
            <span className="strip-star">✳</span>
            <span>On prépare le reste ensemble.</span>
          </div>
        </section>
        <section id="comment-ca-marche" className="container how">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                MOINS DE CLICS, PLUS DE PERSPECTIVES
              </span>
              <h2>
                Une recherche.
                <br />
                Enfin à votre rythme.
              </h2>
            </div>
            <p>
              Pas besoin de repartir de zéro à chaque offre.
              <br />
              Votre prochain chapitre tient en trois étapes.
            </p>
          </div>
          <div className="steps">
            {[
              {
                n: "01",
                icon: "◎",
                title: "Dites-nous qui vous êtes",
                text: "Quelques informations, vos expériences et votre CV. Votre profil devient le point de départ de vos candidatures.",
              },
              {
                n: "02",
                icon: "⌕",
                title: "Tracez votre prochaine étape",
                text: "Un poste, une ville, un salaire. Définissez les critères qui comptent vraiment pour vous.",
              },
              {
                n: "03",
                icon: "↗",
                title: "Gardez le fil, simplement",
                text: "Retrouvez vos candidatures dans un seul espace et préparez vos prochaines recherches automatisées.",
              },
            ].map((step) => (
              <article key={step.n}>
                <div className="step-top">
                  <span>{step.n}</span>
                  <span>{step.icon}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="container">
          <div className="closing">
            <span className="eyebrow">LA SUITE VOUS APPARTIENT</span>
            <h2>
              Vous avez du talent.
              <br />
              Donnez-lui de l’élan.
            </h2>
            <Link className="button light" href="/connexion">
              Créer mon espace <Arrow />
            </Link>
            <p>L’automatisation des envois arrive dans une prochaine étape.</p>
            <span className="closing-spark" aria-hidden="true">
              ✳
            </span>
          </div>
        </section>
      </main>
      <footer className="container footer">
        <Logo />
        <span>Du temps pour vous. De l’élan pour la suite.</span>
        <span>© {new Date().getFullYear()} PKida</span>
      </footer>
    </>
  );
}
