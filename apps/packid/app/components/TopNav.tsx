"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path d="M3 13h8V3H3v10z" />
        <path d="M13 21h8V11h-8v10z" />
        <path d="M3 21h8v-6H3v6z" />
      </svg>
    ),
  },
  {
    label: "Recherche",
    href: "/search",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    label: "Nouveau candidat",
    href: "/add",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
  },
  {
    label: "Nouvelle offre",
    href: "/jobs/new",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h10" />
      </svg>
    ),
  },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-3 shadow-sm shadow-slate-950/20 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1 rounded-full bg-cyan-300" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Espace recruteur
            </p>
            <h2 className="text-base font-semibold text-white">
              Pilotage des recrutements
            </h2>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            const isPrimaryAction = link.href === "/add";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                  isPrimaryAction && !isActive
                    ? "border-cyan-400/40 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                    : isActive
                      ? "border-slate-700 bg-slate-900 text-white"
                      : "border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/80 hover:text-white"
                }`}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
                    isPrimaryAction && !isActive
                      ? "bg-slate-950/10 text-slate-950"
                      : isActive
                        ? "bg-cyan-400/10 text-cyan-200"
                        : "bg-slate-900 text-slate-500"
                  }`}
                >
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
