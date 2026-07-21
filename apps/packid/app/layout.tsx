import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import AppShell from "./components/AppShell";
import "./globals.css";
import {
  isApplicationPagePath,
  isAuthPagePath,
  ORGANIZATION_SETUP_PATH,
} from "./lib/routes";
import { getCurrentUser } from "./lib/server/authService";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Packid - Agent IA Recrutement",
  description: "Tableau de bord et interface de gestion des candidats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-packid-pathname") ?? "/";
  const isApplicationPage = isApplicationPagePath(pathname);
  const isAuthPage = isAuthPagePath(pathname);
  const isOrganizationSetupPage = pathname === ORGANIZATION_SETUP_PATH;

  if (isApplicationPage || isAuthPage || isOrganizationSetupPage) {
    const user = await getCurrentUser();
    const organization = user?.organizationMembers[0]?.organization ?? null;

    if ((isApplicationPage || isOrganizationSetupPage) && !user) {
      redirect(`/login?next=${encodeURIComponent(pathname)}`);
    }

    if (isApplicationPage && user && !organization) {
      redirect(ORGANIZATION_SETUP_PATH);
    }

    if (isOrganizationSetupPage && organization) {
      redirect("/dashboard");
    }

    if (isAuthPage && user) {
      redirect(organization ? "/dashboard" : ORGANIZATION_SETUP_PATH);
    }
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-slate-950 text-slate-100"
      >
        <AppShell>{children}</AppShell>
        <Analytics />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
          strategy="beforeInteractive"
        />
        <Script id="google-analytics" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
