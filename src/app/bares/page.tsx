import Link from "next/link";
import { EscudoBar } from "@/components/escudo-bar";
import { listBars, listCities } from "@/lib/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bares que ponen el fútbol y el baloncesto",
  description:
    "Directorio de bares con pantallas: dirección, servicios y agenda de partidos de cada uno.",
};

function primero(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

export default async function PaginaBares(props: PageProps<"/bares">) {
  const params = await props.searchParams;
  const ciudad = primero(params.ciudad);
  const q = primero(params.q);

  const bares = listBars({ city: ciudad, q });
  const ciudades = listCities();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bares</h1>
        <p className="mt-1 text-slate-400">
          {bares.length} {bares.length === 1 ? "bar" : "bares"} con pantallas
          {ciudad ? ` en ${ciudad}` : " en toda España"}.
        </p>
      </div>

      <form method="get" className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Nombre del bar o calle…"
          aria-label="Buscar bar"
          className="campo sm:flex-1"
        />
        <select
          name="ciudad"
          defaultValue={ciudad ?? ""}
          aria-label="Ciudad"
          className="campo sm:w-48"
        >
          <option value="">Todas las ciudades</option>
          {ciudades.map((nombre) => (
            <option key={nombre} value={nombre}>
              {nombre}
            </option>
          ))}
        </select>
        <button type="submit" className="boton-secundario">
          Buscar
        </button>
      </form>

      {bares.length === 0 ? (
        <div className="tarjeta p-8 text-center text-slate-300">
          <p>No encontramos ningún bar con esa búsqueda.</p>
          <Link href="/bares" className="boton-secundario mt-4">
            Ver todos
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {bares.map((bar) => (
            <Link
              key={bar.id}
              href={`/bares/${bar.slug}`}
              className="tarjeta flex gap-3 p-4 transition-colors hover:border-cesped/40 hover:bg-white/[0.07]"
            >
              <EscudoBar name={bar.name} accent={bar.accent} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{bar.name}</p>
                <p className="truncate text-sm text-slate-400">
                  {bar.address} · {bar.city}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="chip">📺 {bar.screens}</span>
                  {bar.has_terrace === 1 && <span className="chip">☀️ Terraza</span>}
                  {bar.has_food === 1 && <span className="chip">🍽️ Cocina</span>}
                  {bar.accepts_reservations === 1 && <span className="chip">📝 Reservas</span>}
                </div>
                <p className="mt-2 text-sm font-medium text-cesped">
                  {bar.upcoming === 0
                    ? "Sin partidos anunciados"
                    : `${bar.upcoming} ${bar.upcoming === 1 ? "partido" : "partidos"} anunciados`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
