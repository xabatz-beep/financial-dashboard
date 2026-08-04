"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { WHEN_OPTIONS, type When } from "@/lib/cuando";
import { SPORTS, type Sport } from "@/lib/types";

export interface EstadoFiltros {
  when: When;
  sport?: Sport;
  city?: string;
  q?: string;
}

export function FiltrosPartidos({
  ciudades,
  filtros,
}: {
  ciudades: string[];
  filtros: EstadoFiltros;
}) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [texto, setTexto] = useState(filtros.q ?? "");

  function aplicar(cambios: Partial<EstadoFiltros & { q: string }>) {
    const siguiente = { ...filtros, q: texto, ...cambios };
    const params = new URLSearchParams();
    if (siguiente.when && siguiente.when !== "todos") params.set("cuando", siguiente.when);
    if (siguiente.sport) params.set("deporte", siguiente.sport);
    if (siguiente.city) params.set("ciudad", siguiente.city);
    if (siguiente.q) params.set("q", siguiente.q);

    const query = params.toString();
    startTransition(() => router.push(query ? `/?${query}` : "/"));
  }

  return (
    <div className={`space-y-3 ${pendiente ? "opacity-60" : ""}`}>
      <div className="sin-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {WHEN_OPTIONS.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            onClick={() => aplicar({ when: opcion.id })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filtros.when === opcion.id
                ? "bg-cesped text-noche-950"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {opcion.label}
          </button>
        ))}

        <span className="mx-1 w-px shrink-0 bg-white/10" />

        <button
          type="button"
          onClick={() => aplicar({ sport: undefined })}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            !filtros.sport
              ? "bg-white/15 text-white"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          Todo
        </button>
        {SPORTS.map((deporte) => (
          <button
            key={deporte.id}
            type="button"
            onClick={() =>
              aplicar({ sport: filtros.sport === deporte.id ? undefined : deporte.id })
            }
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filtros.sport === deporte.id
                ? "bg-white/15 text-white"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <span aria-hidden>{deporte.emoji}</span> {deporte.label}
          </button>
        ))}
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          aplicar({});
        }}
      >
        <input
          type="search"
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          placeholder="Busca un equipo o una competición…"
          aria-label="Buscar equipo o competición"
          className="campo sm:flex-1"
        />
        <select
          value={filtros.city ?? ""}
          onChange={(event) => aplicar({ city: event.target.value || undefined })}
          aria-label="Ciudad"
          className="campo sm:w-48"
        >
          <option value="">Todas las ciudades</option>
          {ciudades.map((ciudad) => (
            <option key={ciudad} value={ciudad}>
              {ciudad}
            </option>
          ))}
        </select>
        <button type="submit" className="boton-secundario">
          Buscar
        </button>
      </form>
    </div>
  );
}
