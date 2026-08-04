import Link from "next/link";
import { FiltrosPartidos } from "@/components/filtros-partidos";
import { TarjetaPartido } from "@/components/tarjeta-partido";
import { dayKey, formatDayLabel } from "@/lib/format";
import { listCities, listMatches, type When } from "@/lib/queries";
import type { MatchListItem, Sport } from "@/lib/types";

const WHENS: When[] = ["todos", "hoy", "manana", "finde"];
const DEPORTES: Sport[] = ["futbol", "baloncesto"];

function primero(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

export default async function Page(props: PageProps<"/">) {
  const params = await props.searchParams;

  const cuando = primero(params.cuando);
  const deporte = primero(params.deporte);
  const filtros = {
    when: (WHENS.includes(cuando as When) ? cuando : "todos") as When,
    sport: DEPORTES.includes(deporte as Sport) ? (deporte as Sport) : undefined,
    city: primero(params.ciudad),
    q: primero(params.q),
  };

  const now = new Date();
  const partidos = listMatches(filtros);
  const ciudades = listCities();

  const porDia = partidos.reduce<Record<string, MatchListItem[]>>((grupos, partido) => {
    const clave = dayKey(partido.starts_at);
    (grupos[clave] ??= []).push(partido);
    return grupos;
  }, {});

  return (
    <div className="space-y-6">
      <section className="tarjeta bg-gradient-to-br from-cesped/15 to-transparent p-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          ¿Dónde ver el partido esta noche?
        </h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Los bares publican qué partidos de fútbol y baloncesto van a poner. Tú eliges por
          cercanía, ambiente, pantallas o promoción.{" "}
          <Link href="/panel" className="font-medium text-cesped hover:underline">
            ¿Tienes un bar? Publica tu agenda gratis
          </Link>
          .
        </p>
      </section>

      <FiltrosPartidos ciudades={ciudades} filtros={filtros} />

      {partidos.length === 0 ? (
        <div className="tarjeta p-8 text-center">
          <p className="text-lg font-semibold">No hay partidos con esos filtros</p>
          <p className="mt-1 text-slate-400">
            Prueba a quitar la ciudad o a mirar los próximos días.
          </p>
          <Link href="/" className="boton-secundario mt-4">
            Ver todos los partidos
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(porDia).map(([clave, delDia]) => (
            <section key={clave} className="space-y-2">
              <h2 className="sticky top-16 z-10 -mx-1 bg-noche-950/85 px-1 py-1.5 text-sm font-semibold text-slate-400 uppercase backdrop-blur">
                {formatDayLabel(delDia[0].starts_at, now)}
                <span className="ml-2 font-normal normal-case">
                  · {delDia.length} {delDia.length === 1 ? "partido" : "partidos"}
                </span>
              </h2>
              <div className="space-y-2">
                {delDia.map((partido) => (
                  <TarjetaPartido key={partido.id} match={partido} now={now} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
