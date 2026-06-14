"use client";

import { usePathname } from "next/navigation";
import TopNav from "./TopNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApplicationPage = pathname !== "/" && pathname !== "/login";

  return (
    <div className="flex min-h-screen">
      {isApplicationPage && (
        <div className="border-slate-800 bg-slate-950">
          <aside className="sticky left-0 top-0 z-20 hidden h-screen w-24 flex-col items-center gap-6 border-r border-slate-800 bg-slate-950 px-4 py-8 text-slate-300 md:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-lg shadow-slate-950/20">
              SE
            </div>
            <nav className="flex flex-col items-center gap-3">
              <a
                href="/profile"
                className="group flex w-full flex-col items-center gap-2 rounded-3xl px-3 py-4 text-center transition hover:bg-slate-900 hover:text-white"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 group-hover:text-emerald-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                </span>
                <span className="text-xs">Profil</span>
              </a>
              <a
                href="/subscriptions"
                className="group flex w-full flex-col items-center gap-2 rounded-3xl px-3 py-4 text-center transition hover:bg-slate-900 hover:text-white"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 group-hover:text-cyan-300">
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
                </span>
                <span className="text-xs">Abonnements</span>
              </a>
              <a
                href="/billing"
                className="group flex w-full flex-col items-center gap-2 rounded-3xl px-3 py-4 text-center transition hover:bg-slate-900 hover:text-white"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 group-hover:text-emerald-300">
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
                </span>
                <span className="text-xs">Connecteurs</span>
              </a>
              <a
                href="/settings"
                className="group flex w-full flex-col items-center gap-2 rounded-3xl px-3 py-4 text-center transition hover:bg-slate-900 hover:text-white"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 group-hover:text-cyan-300">
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
                </span>
                <span className="text-xs">Paramètres</span>
              </a>
            </nav>
            <a
              href="/logout"
              className="group mt-auto flex w-full flex-col items-center gap-2 rounded-3xl bg-red-500/10 px-3 py-4 text-center text-red-300 transition hover:bg-red-500/15 hover:text-red-100"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 group-hover:text-red-100">
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
              <span className="text-xs">Déconnexion</span>
            </a>
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {isApplicationPage && <TopNav />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
