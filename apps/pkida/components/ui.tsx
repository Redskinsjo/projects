import Link from "next/link";
export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="PKida, accueil">
      <span className="logo-mark">
        p<span>↗</span>
      </span>
      pkida<span className="logo-dot">.</span>
    </Link>
  );
}
export function Arrow({ children = "↗" }: { children?: React.ReactNode }) {
  return <span aria-hidden="true">{children}</span>;
}
export function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}
export function AppHeader() {
  return (
    <header className="app-header">
      <div className="container nav">
        <Logo />
        <nav aria-label="Navigation principale">
          <Link className="nav-active" href="/espace">
            Mon espace
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="text-button" type="submit">
              Se déconnecter <Arrow>↗</Arrow>
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
