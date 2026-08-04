import Link from "next/link";
import { notFound } from "next/navigation";
import { ListaEmisiones, type EmisionVista } from "@/components/lista-emisiones";
import { readVisitorId } from "@/lib/auth";
import { formatDayTime, matchState, relativeTime } from "@/lib/format";
import { attendanceOf, getMatch, listScreeningsForMatch } from "@/lib/queries";
import type { Metadata } from "next";

export async function generateMetadata(props: PageProps<"/partidos/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const partido = getMatch(Number(id));
  if (!partido) return { title: "Partido no encontrado" };

  return {
    title: `${partido.home_team} - ${partido.away_team}: bares que lo emiten`,
    description: `Bares donde ver ${partido.home_team} contra ${partido.away_team} (${partido.competition_name}).`,
  };
}

export default async function PaginaPartido(props: PageProps<"/partidos/[id]">) {
  const { id } = await props.params;
  const params = await props.searchParams;
  const ciudad = Array.isArray(params.ciudad) ? params.ciudad[0] : params.ciudad;

  const partido = getMatch(Number(id));
  if (!partido) notFound();

  const now = new Date();
  const estado = matchState(partido.starts_at, partido.sport, now);
  const todas = listScreeningsForMatch(partido.id);
  const emisiones = ciudad ? todas.filter((emision) => emision.bar.city === ciudad) : todas;

  const ciudades = [...new Set(todas.map((emision) => emision.bar.city))].sort();
  const visitante = await readVisitorId();
  const misAsistencias = attendanceOf(
    visitante,
    emisiones.map((emision) => emision.id),
  );

  const vistas: EmisionVista[] = emisiones.map((emision) => ({
    id: emision.id,
    going: emision.going,
    yaVoy: misAsistencias.has(emision.id),
    soundOn: Boolean(emision.sound_on),
    screens: emision.screens,
    reservationRequired: Boolean(emision.reservation_required),
    promo: emision.promo,
    note: emision.note,
    bar: {
      slug: emision.bar.slug,
      name: emision.bar.name,
      city: emision.bar.city,
      address: emision.bar.address,
      lat: emision.bar.lat,
      lng: emision.bar.lng,
      phone: emision.bar.phone,
      accent: emision.bar.accent,
      hasTerrace: Boolean(emision.bar.has_terrace),
      hasFood: Boolean(emision.bar.has_food),
      acceptsReservations: Boolean(emision.bar.accepts_reservations),
    },
  }));

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-slate-400 hover:text-cesped">
        ‹ Volver a los partidos
      </Link>

      <section className="tarjeta p-6">
        <p className="text-sm text-slate-400">
          <span aria-hidden>{partido.competition_emoji}</span> {partido.competition_name}
          {partido.round ? ` · ${partido.round}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {partido.home_team} <span className="text-slate-500">—</span> {partido.away_team}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="chip">🗓️ {formatDayTime(partido.starts_at, now)}</span>
          {partido.channel && <span className="chip">📡 {partido.channel}</span>}
          {estado === "en-juego" ? (
            <span className="chip border-rose-400/30 bg-rose-400/10 text-rose-300">
              🔴 En juego
            </span>
          ) : estado === "proximo" ? (
            <span className="chip">⏱️ Empieza {relativeTime(partido.starts_at, now)}</span>
          ) : (
            <span className="chip">Terminado</span>
          )}
        </div>
      </section>

      {ciudades.length > 1 && (
        <div className="sin-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          <Link
            href={`/partidos/${partido.id}`}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${
              !ciudad
                ? "bg-white/15 text-white"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Todas
          </Link>
          {ciudades.map((nombre) => (
            <Link
              key={nombre}
              href={`/partidos/${partido.id}?ciudad=${encodeURIComponent(nombre)}`}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${
                ciudad === nombre
                  ? "bg-white/15 text-white"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {nombre}
            </Link>
          ))}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {vistas.length === 0
            ? "Todavía no hay bares"
            : `${vistas.length} ${vistas.length === 1 ? "bar lo emite" : "bares lo emiten"}`}
          {ciudad ? ` en ${ciudad}` : ""}
        </h2>

        {vistas.length === 0 ? (
          <div className="tarjeta p-8 text-center">
            <p className="text-slate-300">
              Ningún bar ha anunciado este partido{ciudad ? ` en ${ciudad}` : ""} todavía.
            </p>
            <Link href="/panel" className="boton-primario mt-4">
              Soy un bar y lo voy a poner
            </Link>
          </div>
        ) : (
          <ListaEmisiones emisiones={vistas} />
        )}
      </section>
    </div>
  );
}
