import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { AuthBootstrap } from "@/components/AuthBootstrap";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CarbonFlow — MVP Hackathon",
  description:
    "Diagnóstico geoespacial, formulación, validación y registro, y mercado de carbono para Colombia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${lexend.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-[family-name:var(--font-lexend)]">
        <AuthBootstrap />
        <NavBar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
