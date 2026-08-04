import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonVoy } from "@/components/boton-voy";
import { EscudoBar } from "@/components/escudo-bar";
import { readVisitorId } from "@/lib/auth";
import { formatDayLabel, formatTime } from "@/lib/format";
import { mapsUrl } from "@/lib/geo";
import { attendanceOf, getBarBySlug, listScreeningsForBar } from "@/lib/queries";
import type { Metadata } from "next";

export async function generateMetadata(props: PageProps<"/bares/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const bar = getBarBySlug(slug);
  if (!bar) return { title: "Bar no encontrado" };

  return {
    title: `${bar.name} (${bar.city}): partidos que emite`,
    description: bar.description ?? `Agenda de partidos de ${bar.name} en ${bar.city}.`,
  };
}

export default async function PaginaBar(props: PageProps<"/bares/[slug]">) {
  const { slug } = await props.params;
  const bar = getBarBySlug(slug);
  if (!bar) notFound();

  const now = new Date();
  const agenda = listScreeningsForBar(bar.id);
  const visitante = await readVisitorId();
  const misAsistencias = attendanceOf(
    visitante,
    agenda.map((emision) => emision.id),
  );

  return (
    <div className="space-y-6">
      <Link href="/bares" className="text-sm text-slate-400 hover:text-cesped">
        ‹ Todos los bares
      </Link>

      <section className="tarjeta p-6">
        <div className="flex flex-wrap items-start gap-4">
          <EscudoBar name={bar.name} accent={bar.accent} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{bar.name}</h1>
            <p className="text-slate-400">
              {bar.address} · {bar.city}
            </p>
            {bar.description && <p className="mt-3 text-slate-300">{bar.description}</p>}

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip">
                📺 {bar.screens} {bar.screens === 1 ? "pantalla" : "pantallas"}
              </span>
              {bar.has_terrace === 1 && <span className="chip">☀️ Terraza</span>}
              {bar.has_food === 1 && <span className="chip">🍽️ Cocina</span>}
              {bar.accepts_reservations === 1 && <span className="chip">📝 Acepta reservas</span>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={mapsUrl(bar.name, bar.address, bar.city)}
                target="_blank"
                rel="noreferrer"
                className="boton-secundario"
              >
                Cómo llegar
              </a>
              {bar.phone && (
                <a href={`tel:${bar.phone.replace(/\s/g, "")}`} className="boton-secundario">
                  Llamar · {bar.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Qué van a poner</h2>

        {agenda.length === 0 ? (
          <div className="tarjeta p-8 text-center text-slate-300">
            Este bar todavía no ha anunciado ningún partido.
          </div>
        ) : (
          <ul className="space-y-2">
            {agenda.map((emision) => (
              <li key={emision.id} className="tarjeta p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400">
                      {formatDayLabel(emision.match.starts_at, now)} ·{" "}
                      {formatTime(emision.match.starts_at)} · {emision.match.competition_name}
                    </p>
                    <Link
                      href={`/partidos/${emision.match.id}`}
                      className="font-semibold hover:text-cesped"
                    >
                      {emision.match.home_team} <span className="text-slate-500">—</span>{" "}
                      {emision.match.away_team}
                    </Link>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="chip">📺 {emision.screens}</span>
                      <span className={`chip ${emision.sound_on === 1 ? "text-cesped" : ""}`}>
                        {emision.sound_on === 1 ? "🔊 Con sonido" : "🔇 Sin sonido"}
                      </span>
                      {emision.reservation_required === 1 && (
                        <span className="chip border-amber-400/30 bg-amber-400/10 text-amber-300">
                          📝 Hay que reservar
                        </span>
                      )}
                    </div>

                    {emision.promo && (
                      <p className="mt-2 text-sm font-medium text-cerveza">🍺 {emision.promo}</p>
                    )}
                    {emision.note && (
                      <p className="mt-1 text-sm text-slate-400">{emision.note}</p>
                    )}
                  </div>

                  <BotonVoy
                    screeningId={emision.id}
                    going={misAsistencias.has(emision.id)}
                    count={emision.going}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
