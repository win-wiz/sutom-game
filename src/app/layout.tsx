import type { Metadata } from "next";
import "../styles/globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import { GameProvider } from "@/contexts/GameContext";
import ScrollToTop from "@/components/scroll-to-top";


export const metadata: Metadata = {
  title: "Sutom Game - Jeu de Mots Français Gratuit | Défi Quotidien",
  description: "Jouez au Sutom Game, le meilleur jeu de devinettes de mots français ! Défi quotidien et mode classique avec 3 niveaux. Testez vos compétences linguistiques.",
  keywords: "Sutom Game, jeu de mots français, Sutom, Wordle français, devinettes mots, jeu français gratuit, défi quotidien mots, Sutom Game en ligne, jeu de lettres français, puzzle mots français",
  authors: [{ name: "Sutom Game Team" }],
  creator: "Sutom Game",
  publisher: "Sutom Game",
  robots: "index, follow",
  openGraph: {
    title: "Sutom Game - Jeu de Mots Français Gratuit",
    description: "Découvrez le Sutom Game, jeu de devinettes français addictif ! Défi quotidien et mode classique. Jouez gratuitement en ligne.",
    type: "website",
    locale: "fr_FR",
    siteName: "Sutom Game"
  },
  twitter: {
    card: "summary_large_image",
    title: "Sutom Game - Jeu de Mots Français",
    description: "Jouez au Sutom Game, le meilleur jeu de mots français ! Défi quotidien et mode classique. Gratuit en ligne."
  },
  alternates: {
    canonical: "https://sutom-game.com"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-gray-900 font-sans antialiased"
        )}
      >
        <GameProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <ScrollToTop />
          </div>
        </GameProvider>
      </body>
    </html>
  );
}
