import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "PKida — Votre prochain chapitre commence ici",
    template: "%s · PKida",
  },
  description:
    "Préparez votre recherche d’emploi, centralisez vos candidatures et retrouvez du temps pour votre prochain chapitre.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
