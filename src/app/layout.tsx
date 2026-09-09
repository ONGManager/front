import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ONG Manager",
  description: "Plataforma de gestão para ONGs com gerenciamento de membros, tarefas, finanças e eventos em um ambiente seguro e intuitivo.",
  keywords: ["ONG Manager", "Gestão de ONGs", "Gerenciamento de ONGs", "ONG", "Gestão", "Gerenciamento", "Finanças", "Eventos", "Membros", "Tarefas", "Voluntários", "Doações", "ONGManager", "ONGManager Front"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--bg)] text-[var(--text)]`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
