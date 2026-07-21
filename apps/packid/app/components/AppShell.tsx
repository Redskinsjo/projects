"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isApplicationPagePath } from "../lib/routes";
import TopNav from "./TopNav";
import UserAvatar from "./UserAvatar";

type ShellUser = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

const sidebarLinks = [
  {
    label: "Profil",
    href: "/profile",
    description: "Compte",
    icon: null,
  },
  {
    label: "Connecteurs",
    href: "/connectors",
    description: "Intégrations",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path d="M12 1v22" />
        <path d="M5 7h14" />
        <path d="M5 17h14" />
      </svg>
    ),
  },
  {
    label: "Abonnements",
    href: "/subscriptions",
    description: "Offre et facturation",
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
        <path d="M4 17h16" />
      </svg>
    ),
  },
  {
    label: "Paramètres",
    href: "/settings",
    description: "Préférences",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<ShellUser | null>(null);
  const isApplicationPage = isApplicationPagePath(pathname);

  useEffect(() => {
    if (!isApplicationPage) {
      return;
    }

    let isMounted = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { user?: ShellUser | null } | null) => {
        if (isMounted) {
          setUser(payload?.user ?? null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isApplicationPage, pathname]);

  return (
    <div className="flex min-h-screen">
      {isApplicationPage && (
        <aside className="sticky left-0 top-0 z-20 hidden h-screen w-64 shrink-0 border-r border-slate-800 bg-slate-950 px-4 py-5 text-slate-300 shadow-xl shadow-slate-950/20 md:flex md:flex-col">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-bold tracking-tight text-slate-950">
              P
            </span>
            <span>
              <span className="block text-sm font-semibold text-white">
                Packid
              </span>
              <span className="block text-xs text-slate-500">
                Espace recruteur
              </span>
            </span>
          </Link>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
            <div className="flex items-center gap-3">
              <UserAvatar
                user={user}
                className="h-10 w-10 rounded-lg"
                textClassName="text-sm font-semibold"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
                    "Profil utilisateur"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.email ?? "Compte Packid"}
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-1">
            <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Administration
            </p>
            {sidebarLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-slate-900 text-white ring-1 ring-slate-700"
                      : "text-slate-400 hover:bg-slate-900/80 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                      isActive
                        ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                        : "border-slate-800 bg-slate-950 text-slate-500 group-hover:border-slate-700 group-hover:text-slate-200"
                    }`}
                  >
                    {link.icon ?? (
                      <UserAvatar
                        user={user}
                        className="h-9 w-9 rounded-lg shadow-none"
                        textClassName="text-xs font-semibold"
                      />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {link.label}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {link.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/logout"
            className="group mt-4 flex items-center gap-3 rounded-lg border border-slate-800 px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-500 transition group-hover:bg-red-500/10 group-hover:text-red-200">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
            </span>
            <span>Déconnexion</span>
          </Link>
        </aside>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {isApplicationPage && <TopNav />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
