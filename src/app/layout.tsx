import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { NavPrincipal } from "@/components/nav-principal";

export const metadata: Metadata = {
  title: "¿Dónde lo echan? · Encuentra el bar que pone tu partido",
  description:
    "Consulta qué bares emiten cada partido de fútbol y baloncesto, con pantallas, sonido, promociones y cuánta gente va. Los bares publican su agenda gratis.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-noche-950/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-xl bg-cesped text-lg text-noche-950"
              >
                📺
              </span>
              <span className="hidden sm:block">
                ¿Dónde lo <span className="text-cesped">echan</span>?
              </span>
            </Link>
            <NavPrincipal />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>

        <footer className="border-t border-white/10 px-4 py-8 text-sm text-slate-500">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <strong className="text-slate-300">¿Dónde lo echan?</strong> · Partidos, bares y
              cañas. Datos de demostración.
            </p>
            <Link href="/panel" className="hover:text-cesped">
              Área para bares
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
