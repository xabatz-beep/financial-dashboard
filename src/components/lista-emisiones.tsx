"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BotonVoy } from "@/components/boton-voy";
import { EscudoBar } from "@/components/escudo-bar";
import { formatDistance } from "@/lib/format";
import { distanceKm, mapsUrl } from "@/lib/geo";

export interface EmisionVista {
  id: number;
  going: number;
  yaVoy: boolean;
  soundOn: boolean;
  screens: number;
  reservationRequired: boolean;
  promo: string | null;
  note: string | null;
  bar: {
    slug: string;
    name: string;
    city: string;
    address: string;
    lat: number;
    lng: number;
    phone: string | null;
    accent: string;
    hasTerrace: boolean;
    hasFood: boolean;
    acceptsReservations: boolean;
  };
}

type Orden = "gente" | "cerca";

export function ListaEmisiones({ emisiones }: { emisiones: EmisionVista[] }) {
  const [orden, setOrden] = useState<Orden>("gente");
  const [posicion, setPosicion] = useState<{ lat: number; lng: number } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  function ordenarPorCercania() {
    if (posicion) {
      setOrden("cerca");
      return;
    }
    if (!("geolocation" in navigator)) {
      setAviso("Tu navegador no permite compartir la ubicación.");
      return;
    }

    setBuscando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosicion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setOrden("cerca");
        setAviso(null);
        setBuscando(false);
      },
      () => {
        setAviso("No hemos podido obtener tu ubicación. Puedes filtrar por ciudad.");
        setBuscando(false);
      },
      { timeout: 8000 },
    );
  }

  const lista = useMemo(() => {
    const conDistancia = emisiones.map((emision) => ({
      emision,
      km: posicion ? distanceKm(posicion, emision.bar) : null,
    }));

    return conDistancia.sort((a, b) => {
      if (orden === "cerca" && a.km != null && b.km != null) return a.km - b.km;
      return b.emision.going - a.emision.going;
    });
  }, [emisiones, orden, posicion]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-400">Ordenar por</span>
        <button
          type="button"
          onClick={() => setOrden("gente")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            orden === "gente"
              ? "bg-white/15 text-white"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          Más ambiente
        </button>
        <button
          type="button"
          onClick={ordenarPorCercania}
          disabled={buscando}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            orden === "cerca"
              ? "bg-white/15 text-white"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          {buscando ? "Buscándote…" : "📍 Más cerca de mí"}
        </button>
      </div>

      {aviso && <p className="text-sm text-amber-300">{aviso}</p>}

      {lista.map(({ emision, km }) => (
        <article key={emision.id} className="tarjeta p-4">
          <div className="flex items-start gap-3">
            <EscudoBar name={emision.bar.name} accent={emision.bar.accent} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <Link
                  href={`/bares/${emision.bar.slug}`}
                  className="font-semibold hover:text-cesped"
                >
                  {emision.bar.name}
                </Link>
                {km != null && (
                  <span className="text-xs font-medium text-cesped">
                    a {formatDistance(km)}
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-slate-400">
                {emision.bar.address} · {emision.bar.city}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="chip">
                  📺 {emision.screens} {emision.screens === 1 ? "pantalla" : "pantallas"}
                </span>
                <span className={`chip ${emision.soundOn ? "text-cesped" : ""}`}>
                  {emision.soundOn ? "🔊 Con sonido" : "🔇 Sin sonido"}
                </span>
                {emision.reservationRequired && (
                  <span className="chip border-amber-400/30 bg-amber-400/10 text-amber-300">
                    📝 Hay que reservar
                  </span>
                )}
                {emision.bar.hasTerrace && <span className="chip">☀️ Terraza</span>}
                {emision.bar.hasFood && <span className="chip">🍽️ Cocina</span>}
              </div>

              {emision.promo && (
                <p className="mt-2 text-sm font-medium text-cerveza">🍺 {emision.promo}</p>
              )}
              {emision.note && (
                <p className="mt-1 text-sm text-slate-400">{emision.note}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <BotonVoy
                  screeningId={emision.id}
                  going={emision.yaVoy}
                  count={emision.going}
                />
                <a
                  href={mapsUrl(emision.bar.name, emision.bar.address, emision.bar.city)}
                  target="_blank"
                  rel="noreferrer"
                  className="boton-secundario px-3 py-2 text-xs"
                >
                  Cómo llegar
                </a>
                {emision.bar.phone && emision.bar.acceptsReservations && (
                  <a
                    href={`tel:${emision.bar.phone.replace(/\s/g, "")}`}
                    className="boton-secundario px-3 py-2 text-xs"
                  >
                    Reservar · {emision.bar.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
