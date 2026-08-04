"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/", label: "Partidos" },
  { href: "/bares", label: "Bares" },
  { href: "/panel", label: "Soy un bar" },
];

export function NavPrincipal() {
  const pathname = usePathname();

  return (
    <nav className="ml-auto flex items-center gap-1 text-sm">
      {ENLACES.map((enlace) => {
        const activo =
          enlace.href === "/"
            ? pathname === "/" || pathname.startsWith("/partidos")
            : pathname.startsWith(enlace.href);

        return (
          <Link
            key={enlace.href}
            href={enlace.href}
            aria-current={activo ? "page" : undefined}
            className={`rounded-lg px-3 py-2 font-medium transition-colors ${
              activo ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-100"
            }`}
          >
            {enlace.label}
          </Link>
        );
      })}
    </nav>
  );
}
