import type { Metadata } from "next";
import "../styles/globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import { GameProvider } from "@/contexts/GameContext";


export const metadata: Metadata = {
  title: "Sutom - French Word Guessing Game",
  description: "A fun and challenging word guessing game based on the popular Sutom and Wordle formats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "h-screen bg-gray-900 font-sans antialiased overflow-hidden"
        )}
      >
        <GameProvider>
          <div className="relative flex h-screen flex-col">
            <Header />
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </GameProvider>
      </body>
    </html>
  );
}
