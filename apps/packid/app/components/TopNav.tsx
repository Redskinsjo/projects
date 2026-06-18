"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    label: "Dashboard",
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
    label: "Candidat",
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
    label: "Offre",
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
    <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-4 shadow-sm shadow-slate-950/20 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Espace recruteur
          </p>
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Navigation rapide
          </h2>
        </div>
        <nav className="flex flex-1 flex-wrap items-center justify-end gap-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex min-w-[10rem] items-center gap-3 rounded-3xl border px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-gradient-to-r from-cyan-400 via-slate-200 to-emerald-400 bg-slate-900 text-white shadow-lg shadow-cyan-500/10"
                    : "border-slate-800 bg-slate-950/95 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-cyan-300">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
