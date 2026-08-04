import { NextResponse } from "next/server";
import { listMatches, listScreeningsForMatch, type When } from "@/lib/queries";
import type { Sport } from "@/lib/types";

const WHENS: When[] = ["todos", "hoy", "manana", "finde"];
const DEPORTES: Sport[] = ["futbol", "baloncesto"];

/**
 * API pública de solo lectura: `/api/partidos?ciudad=Bilbao&deporte=futbol&cuando=hoy`.
 * Añade `?bares=1` para incluir los bares que emiten cada partido.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cuando = url.searchParams.get("cuando") ?? "todos";
  const deporte = url.searchParams.get("deporte") ?? "";

  const partidos = listMatches({
    when: (WHENS.includes(cuando as When) ? cuando : "todos") as When,
    sport: DEPORTES.includes(deporte as Sport) ? (deporte as Sport) : undefined,
    city: url.searchParams.get("ciudad") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    limit: Math.min(Number(url.searchParams.get("limite")) || 50, 200),
  });

  const conBares = url.searchParams.get("bares") === "1";

  return NextResponse.json({
    generado: new Date().toISOString(),
    total: partidos.length,
    partidos: partidos.map((partido) => ({
      id: partido.id,
      deporte: partido.sport,
      competicion: partido.competition_name,
      jornada: partido.round,
      local: partido.home_team,
      visitante: partido.away_team,
      comienza: partido.starts_at,
      canal: partido.channel,
      bares: conBares
        ? listScreeningsForMatch(partido.id).map((emision) => ({
            nombre: emision.bar.name,
            ciudad: emision.bar.city,
            direccion: emision.bar.address,
            sonido: Boolean(emision.sound_on),
            pantallas: emision.screens,
            promo: emision.promo,
            van: emision.going,
          }))
        : partido.bar_count,
    })),
  });
}
