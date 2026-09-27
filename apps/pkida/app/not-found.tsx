import Link from "next/link";
export default function NotFound() {
  return (
    <main className="container error-page">
      <span className="eyebrow">404</span>
      <h1>Un autre chemin vous attend.</h1>
      <p>Cette page n’existe pas.</p>
      <Link className="button" href="/">
        Revenir à l’accueil ↗
      </Link>
    </main>
  );
}
