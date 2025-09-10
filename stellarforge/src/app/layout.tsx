import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import CosmosBackground from "../components/CosmosBackground";
import NightToggle from "../components/NightToggle";
import { ToastProvider } from "../components/Toast";

export const metadata: Metadata = {
  title: "StellarForge",
  description: "Atlas personal al cerului - CRUD astronomie",
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="px-3 md:px-4 py-2 rounded-xl text-[15px] md:text-[16px]
               text-indigo-100/95 hover:text-white bg-white/0 hover:bg-white/10
               ring-1 ring-white/10 hover:ring-white/25 transition"
  >
    {children}
  </a>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="min-h-screen bg-[#070910] text-white">
        <CosmosBackground />

        {}
        <header className="sticky top-0 z-40">
          <div className="mx-auto max-w-6xl px-4 pt-4">
            <div className="relative rounded-2xl border border-white/25 bg-[rgba(8,12,20,.72)] backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,.55)]">
              {}
              <div className="absolute inset-0 -z-10 rounded-2xl pointer-events-none
                              bg-[radial-gradient(120%_60%_at_50%_-20%,rgba(140,120,255,.16),transparent)]" />
              <nav className="flex items-center justify-between px-4 py-3">
                <div className="text-xl md:text-2xl font-black tracking-wide
                                bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300
                                bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(99,102,241,.25)]">
                  StellarForge
                </div>
                <div className="flex items-center gap-3 md:gap-5 lg:gap-7">
                  <NavLink href="/">Acasă</NavLink>
                  <NavLink href="/objects">Obiecte</NavLink>
                  <NavLink href="/sites">Locații</NavLink>
                  <NavLink href="/gear">Echipament</NavLink>
                  <NavLink href="/observations">Observații</NavLink>
                  <span className="ml-1"><NightToggle /></span>
                </div>
              </nav>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/35 to-transparent mt-2" />
        </header>

        <main className="mx-auto max-w-6xl p-6">
          <ToastProvider>
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5">
              {children}
            </div>
          </ToastProvider>
        </main>
      </body>
    </html>
  );
}
