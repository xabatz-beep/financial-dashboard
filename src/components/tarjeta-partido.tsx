import Link from "next/link";
import { formatTime, matchState, relativeTime } from "@/lib/format";
import type { MatchListItem } from "@/lib/types";

const DEPORTE_EMOJI: Record<string, string> = { futbol: "⚽", baloncesto: "🏀" };

export function TarjetaPartido({ match, now }: { match: MatchListItem; now: Date }) {
  const estado = matchState(match.starts_at, match.sport, now);

  return (
    <Link
      href={`/partidos/${match.id}`}
      className="tarjeta group flex items-stretch gap-4 p-4 transition-colors hover:border-cesped/40 hover:bg-white/[0.07]"
    >
      <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-1 border-r border-white/10 pr-4">
        <span className="font-mono text-lg font-semibold tabular-nums">
          {formatTime(match.starts_at)}
        </span>
        {estado === "en-juego" ? (
          <span className="flex items-center gap-1 text-[10px] font-bold tracking-wide text-rose-400 uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-rose-400" />
            En juego
          </span>
        ) : (
          <span className="text-center text-[10px] leading-tight text-slate-500">
            {relativeTime(match.starts_at, now)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-slate-400">
          <span aria-hidden>{DEPORTE_EMOJI[match.sport]}</span> {match.competition_name}
          {match.round ? ` · ${match.round}` : ""}
        </p>
        <p className="mt-0.5 truncate font-semibold">
          {match.home_team} <span className="text-slate-500">—</span> {match.away_team}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {match.channel && <span className="chip">📡 {match.channel}</span>}
          <span
            className={`chip ${
              match.bar_count > 0
                ? "border-cesped/30 bg-cesped/10 text-cesped"
                : "text-slate-500"
            }`}
          >
            🍺{" "}
            {match.bar_count === 0
              ? "Ningún bar todavía"
              : `${match.bar_count} ${match.bar_count === 1 ? "bar" : "bares"}`}
          </span>
        </div>
      </div>

      <span
        aria-hidden
        className="self-center text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-cesped"
      >
        ›
      </span>
    </Link>
  );
}
