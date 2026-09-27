"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container error-page">
      <h1>Un petit contretemps.</h1>
      <p>Nous n’avons pas pu charger cette page. Réessayez dans un instant.</p>
      <button className="button" onClick={reset}>
        Réessayer ↗
      </button>
    </main>
  );
}
