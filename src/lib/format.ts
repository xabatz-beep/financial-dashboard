import type { Sport } from "./types";

export const TZ = "Europe/Madrid";
export const LOCALE = "es-ES";

/** Desfase horario (en minutos) de una zona respecto a UTC en un instante dado. */
function offsetMinutes(date: Date, timeZone = TZ): number {
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")!.value; // p. ej. "GMT+02:00"

  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(label);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/** Construye el instante UTC (ISO) de una fecha y hora locales españolas. */
export function madridIso(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): string {
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute);
  const offset = offsetMinutes(new Date(asIfUtc));
  return new Date(asIfUtc - offset * 60_000).toISOString();
}

/** Clave de día natural español, p. ej. "2026-08-04". Sirve para agrupar y comparar. */
export function dayKey(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** "21:00" */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "sábado, 4 de agosto" */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

/** "Hoy", "Mañana" o "sábado, 4 de agosto". */
export function formatDayLabel(iso: string, now = new Date()): string {
  const key = dayKey(iso);
  if (key === dayKey(now)) return "Hoy";
  if (key === dayKey(new Date(now.getTime() + 86_400_000))) return "Mañana";
  return formatDate(iso);
}

/** "Hoy a las 21:00" */
export function formatDayTime(iso: string, now = new Date()): string {
  const label = formatDayLabel(iso, now);
  const time = formatTime(iso);
  return label === "Hoy" || label === "Mañana"
    ? `${label} a las ${time}`
    : `${label} · ${time}`;
}

/** Duración aproximada de un partido, para saber si sigue en juego. */
const DURATION_MINUTES: Record<Sport, number> = {
  futbol: 115,
  baloncesto: 125,
};

export function matchState(
  iso: string,
  sport: Sport,
  now = new Date(),
): "proximo" | "en-juego" | "terminado" {
  const start = new Date(iso).getTime();
  const end = start + DURATION_MINUTES[sport] * 60_000;
  const t = now.getTime();
  if (t < start) return "proximo";
  return t <= end ? "en-juego" : "terminado";
}

/** "en 2 h 15 min", "empieza ya", "hace 40 min". */
export function relativeTime(iso: string, now = new Date()): string {
  const diffMin = Math.round((new Date(iso).getTime() - now.getTime()) / 60_000);
  const abs = Math.abs(diffMin);
  if (abs < 5) return "empieza ya";
  const body =
    abs < 60
      ? `${abs} min`
      : abs < 60 * 24
        ? `${Math.floor(abs / 60)} h ${abs % 60 ? `${abs % 60} min` : ""}`.trim()
        : `${Math.round(abs / (60 * 24))} días`;
  return diffMin > 0 ? `en ${body}` : `hace ${body}`;
}

/** "450 m" / "2,3 km" */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}
