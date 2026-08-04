import Link from "next/link";
import { CamposEmision } from "@/components/campos-emision";
import { EscudoBar } from "@/components/escudo-bar";
import { currentSession } from "@/lib/auth";
import { formatDayLabel, formatTime } from "@/lib/format";
import { listMatchesForBar, listScreeningsForBar } from "@/lib/queries";
import { SPORTS, type Sport } from "@/lib/types";
import { accionBorrarEmision, accionGuardarEmision, accionSalir } from "./actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel del bar",
  description: "Publica qué partidos vas a poner y llena tu bar.",
};

const DEPORTES: Sport[] = ["futbol", "baloncesto"];

export default async function PaginaPanel(props: PageProps<"/panel">) {
  const sesion = await currentSession();
  if (!sesion) return <Bienvenida />;

  const params = await props.searchParams;
  const bruto = Array.isArray(params.deporte) ? params.deporte[0] : params.deporte;
  const deporte = DEPORTES.includes(bruto as Sport) ? (bruto as Sport) : undefined;

  const { bar, owner } = sesion;
  const now = new Date();
  const agenda = listScreeningsForBar(bar.id);
  const candidatos = listMatchesForBar(bar.id, deporte).filter((partido) => !partido.announced);
  const totalVan = agenda.reduce((suma, emision) => suma + emision.going, 0);

  return (
    <div className="space-y-6">
      <section className="tarjeta flex flex-wrap items-center gap-4 p-6">
        <EscudoBar name={bar.name} accent={bar.accent} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-400">Hola, {owner.name}</p>
          <h1 className="text-2xl font-bold tracking-tight">{bar.name}</h1>
          <p className="text-sm text-slate-400">
            {bar.address} · {bar.city}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/bares/${bar.slug}`} className="boton-secundario">
            Ver ficha pública
          </Link>
          <Link href="/panel/perfil" className="boton-secundario">
            Editar bar
          </Link>
          <form action={accionSalir}>
            <button type="submit" className="boton-secundario">
              Salir
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Dato valor={agenda.length} etiqueta="partidos anunciados" />
        <Dato valor={totalVan} etiqueta="personas han dicho “voy”" />
        <Dato valor={bar.screens} etiqueta="pantallas en tu bar" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tu agenda</h2>

        {agenda.length === 0 ? (
          <p className="tarjeta p-6 text-slate-400">
            Todavía no has anunciado ningún partido. Añade los de esta semana desde la lista de
            abajo: aparecerás en las búsquedas de la gente de tu ciudad.
          </p>
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
                    <p className="font-semibold">
                      {emision.match.home_team} <span className="text-slate-500">—</span>{" "}
                      {emision.match.away_team}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="chip">📺 {emision.screens}</span>
                      <span className="chip">
                        {emision.sound_on === 1 ? "🔊 Con sonido" : "🔇 Sin sonido"}
                      </span>
                      {emision.reservation_required === 1 && (
                        <span className="chip">📝 Con reserva</span>
                      )}
                      <span className="chip border-cesped/30 bg-cesped/10 text-cesped">
                        👥 {emision.going} van
                      </span>
                    </div>
                    {emision.promo && (
                      <p className="mt-2 text-sm text-cerveza">🍺 {emision.promo}</p>
                    )}
                  </div>

                  <form action={accionBorrarEmision}>
                    <input type="hidden" name="screeningId" value={emision.id} />
                    <input type="hidden" name="matchId" value={emision.match.id} />
                    <button
                      type="submit"
                      className="boton-secundario px-3 py-2 text-xs hover:border-rose-400/40 hover:text-rose-300"
                    >
                      Quitar
                    </button>
                  </form>
                </div>

                <details className="mt-3 border-t border-white/10 pt-3">
                  <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-200">
                    Editar detalles
                  </summary>
                  <form action={accionGuardarEmision} className="mt-3 space-y-3">
                    <input type="hidden" name="matchId" value={emision.match.id} />
                    <CamposEmision
                      idPrefijo={`emision-${emision.id}`}
                      maxScreens={bar.screens}
                      valores={{
                        screens: emision.screens,
                        soundOn: emision.sound_on === 1,
                        reservationRequired: emision.reservation_required === 1,
                        promo: emision.promo,
                        note: emision.note,
                      }}
                    />
                    <button type="submit" className="boton-primario">
                      Guardar cambios
                    </button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-lg font-semibold">Añadir partidos</h2>
          <Link
            href="/panel"
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              !deporte
                ? "bg-white/15 text-white"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Todo
          </Link>
          {SPORTS.map((item) => (
            <Link
              key={item.id}
              href={`/panel?deporte=${item.id}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                deporte === item.id
                  ? "bg-white/15 text-white"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <span aria-hidden>{item.emoji}</span> {item.label}
            </Link>
          ))}
        </div>

        {candidatos.length === 0 ? (
          <p className="tarjeta p-6 text-slate-400">
            Ya has anunciado todos los partidos disponibles. ¡Buen trabajo!
          </p>
        ) : (
          <ul className="space-y-2">
            {candidatos.map((partido) => (
              <li key={partido.id} className="tarjeta p-4">
                <details>
                  <summary className="flex cursor-pointer flex-wrap items-center gap-2">
                    <span className="font-mono text-sm tabular-nums text-slate-400">
                      {formatDayLabel(partido.starts_at, now)} {formatTime(partido.starts_at)}
                    </span>
                    <span className="font-semibold">
                      {partido.home_team} <span className="text-slate-500">—</span>{" "}
                      {partido.away_team}
                    </span>
                    <span className="chip ml-auto">{partido.competition_name}</span>
                    <span className="chip">🍺 {partido.bar_count}</span>
                    <span className="chip border-cesped/30 bg-cesped/10 text-cesped">
                      + Anunciar
                    </span>
                  </summary>

                  <form action={accionGuardarEmision} className="mt-3 space-y-3">
                    <input type="hidden" name="matchId" value={partido.id} />
                    <CamposEmision idPrefijo={`nuevo-${partido.id}`} maxScreens={bar.screens} />
                    <button type="submit" className="boton-primario">
                      Anunciar este partido
                    </button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Dato({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <div className="tarjeta p-4">
      <p className="text-3xl font-bold tabular-nums text-cesped">{valor}</p>
      <p className="text-sm text-slate-400">{etiqueta}</p>
    </div>
  );
}

function Bienvenida() {
  return (
    <div className="space-y-6">
      <section className="tarjeta bg-gradient-to-br from-cesped/15 to-transparent p-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Llena tu bar los días de partido
        </h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Publica qué partidos vas a poner, con cuántas pantallas, si llevan sonido y qué
          promoción tienes. Aparecerás cuando alguien busque dónde ver ese partido en tu ciudad.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/panel/alta" className="boton-primario">
            Dar de alta mi bar
          </Link>
          <Link href="/panel/entrar" className="boton-secundario">
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            titulo: "Publica tu agenda",
            texto: "Eliges de la lista de partidos y añades los detalles en dos clics.",
          },
          {
            titulo: "Te encuentran",
            texto: "Apareces en la búsqueda por partido y por cercanía junto a tus promociones.",
          },
          {
            titulo: "Sabes cuánta gente viene",
            texto: "Cada persona que dice “voy” queda registrada para que prepares la sala.",
          },
        ].map((bloque) => (
          <div key={bloque.titulo} className="tarjeta p-5">
            <p className="font-semibold">{bloque.titulo}</p>
            <p className="mt-1 text-sm text-slate-400">{bloque.texto}</p>
          </div>
        ))}
      </section>

      <p className="tarjeta p-4 text-sm text-slate-400">
        Para probarlo sin darte de alta: <code className="text-slate-200">demo@elpenalti.es</code>{" "}
        con la contraseña <code className="text-slate-200">partido2026</code>.
      </p>
    </div>
  );
}
