import type { When } from "./cuando";
import { db, row, rows } from "./db";
import { dayKey, madridIso } from "./format";
import type {
  Bar,
  Competition,
  MatchListItem,
  ScreeningWithBar,
  ScreeningWithMatch,
  Sport,
} from "./types";

const MATCH_SELECT = `
  SELECT m.id, m.competition_id, m.home_team, m.away_team, m.starts_at, m.channel, m.round,
         c.name AS competition_name, c.emoji AS competition_emoji, c.sport AS sport,
         (SELECT COUNT(*) FROM screenings s WHERE s.match_id = m.id) AS bar_count
  FROM matches m
  JOIN competitions c ON c.id = m.competition_id
`;

export type { When };

/** Medianoche española de hoy + `offsetDays`, en ISO UTC. */
function midnight(offsetDays: number, now = new Date()): string {
  const [y, m, d] = dayKey(new Date(now.getTime() + offsetDays * 86_400_000))
    .split("-")
    .map(Number);
  return madridIso(y, m, d, 0, 0);
}

/** Intervalo [desde, hasta) que corresponde a cada filtro temporal. */
function range(when: When, now = new Date()): [string, string | null] {
  switch (when) {
    case "hoy":
      return [now.toISOString(), midnight(1, now)];
    case "manana":
      return [midnight(1, now), midnight(2, now)];
    case "finde": {
      const [y, m, d] = dayKey(now).split("-").map(Number);
      const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 domingo … 6 sábado
      const toSaturday = (6 - weekday + 7) % 7;
      const from = weekday === 0 ? midnight(0, now) : midnight(toSaturday, now);
      const to = weekday === 0 ? midnight(1, now) : midnight(toSaturday + 2, now);
      return [from > now.toISOString() ? from : now.toISOString(), to];
    }
    default:
      return [now.toISOString(), null];
  }
}

export interface MatchFilters {
  sport?: Sport;
  city?: string;
  q?: string;
  when?: When;
  limit?: number;
}

export function listMatches(filters: MatchFilters = {}): MatchListItem[] {
  const { sport, city, q, when = "todos", limit = 100 } = filters;
  const [from, to] = range(when);

  const where: string[] = ["m.starts_at >= ?"];
  const params: unknown[] = [from];

  if (to) {
    where.push("m.starts_at < ?");
    params.push(to);
  }
  if (sport) {
    where.push("c.sport = ?");
    params.push(sport);
  }
  if (q) {
    where.push("(m.home_team LIKE ? OR m.away_team LIKE ? OR c.name LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (city) {
    where.push(
      `EXISTS (SELECT 1 FROM screenings s JOIN bars b ON b.id = s.bar_id
               WHERE s.match_id = m.id AND b.city = ?)`,
    );
    params.push(city);
  }

  const sql = `${MATCH_SELECT} WHERE ${where.join(" AND ")} ORDER BY m.starts_at LIMIT ?`;
  return rows<MatchListItem>(
    db.prepare(sql).all(...(([...params, limit] as unknown[]) as never[])),
  );
}

export function getMatch(id: number): MatchListItem | null {
  return row<MatchListItem>(db.prepare(`${MATCH_SELECT} WHERE m.id = ?`).get(id));
}

export function listCities(): string[] {
  const result = db.prepare(`SELECT DISTINCT city FROM bars ORDER BY city`).all() as {
    city: string;
  }[];
  return result.map((r) => r.city);
}

export function listCompetitions(): Competition[] {
  return rows<Competition>(db.prepare(`SELECT * FROM competitions ORDER BY name`).all());
}

const SCREENING_COLUMNS = `
  s.id, s.bar_id, s.match_id, s.sound_on, s.screens, s.reservation_required,
  s.promo, s.note, s.created_at,
  (SELECT COUNT(*) FROM attendances a WHERE a.screening_id = s.id) AS going
`;

const BAR_COLUMNS = `
  b.id AS b_id, b.slug AS b_slug, b.name AS b_name, b.city AS b_city, b.address AS b_address,
  b.lat AS b_lat, b.lng AS b_lng, b.phone AS b_phone, b.description AS b_description,
  b.screens AS b_screens, b.has_terrace AS b_has_terrace, b.has_food AS b_has_food,
  b.accepts_reservations AS b_accepts_reservations, b.accent AS b_accent
`;

type FlatRow = Record<string, unknown>;

function pickBar(r: FlatRow): Bar {
  return {
    id: r.b_id as number,
    slug: r.b_slug as string,
    name: r.b_name as string,
    city: r.b_city as string,
    address: r.b_address as string,
    lat: r.b_lat as number,
    lng: r.b_lng as number,
    phone: (r.b_phone as string) ?? null,
    description: (r.b_description as string) ?? null,
    screens: r.b_screens as number,
    has_terrace: r.b_has_terrace as number,
    has_food: r.b_has_food as number,
    accepts_reservations: r.b_accepts_reservations as number,
    accent: r.b_accent as string,
  };
}

/** Bares que emiten un partido, ordenados por afluencia. */
export function listScreeningsForMatch(matchId: number, city?: string): ScreeningWithBar[] {
  const where = ["s.match_id = ?"];
  const params: unknown[] = [matchId];
  if (city) {
    where.push("b.city = ?");
    params.push(city);
  }

  const result = db
    .prepare(
      `SELECT ${SCREENING_COLUMNS}, ${BAR_COLUMNS}
       FROM screenings s
       JOIN bars b ON b.id = s.bar_id
       WHERE ${where.join(" AND ")}
       ORDER BY going DESC, b.name`,
    )
    .all(...(params as never[])) as FlatRow[];

  return result.map((r) => ({
    id: r.id as number,
    bar_id: r.bar_id as number,
    match_id: r.match_id as number,
    sound_on: r.sound_on as number,
    screens: r.screens as number,
    reservation_required: r.reservation_required as number,
    promo: (r.promo as string) ?? null,
    note: (r.note as string) ?? null,
    created_at: r.created_at as string,
    going: Number(r.going),
    bar: pickBar(r),
  }));
}

/** Agenda de un bar: partidos que ha anunciado, de más próximo a más lejano. */
export function listScreeningsForBar(barId: number, includePast = false): ScreeningWithMatch[] {
  const where = ["s.bar_id = ?"];
  const params: unknown[] = [barId];
  if (!includePast) {
    where.push("m.starts_at >= ?");
    params.push(new Date(Date.now() - 3 * 3_600_000).toISOString());
  }

  const result = db
    .prepare(
      `SELECT ${SCREENING_COLUMNS},
              m.id AS m_id, m.competition_id AS m_competition_id, m.home_team AS m_home_team,
              m.away_team AS m_away_team, m.starts_at AS m_starts_at, m.channel AS m_channel,
              m.round AS m_round, c.name AS m_competition_name, c.emoji AS m_competition_emoji,
              c.sport AS m_sport,
              (SELECT COUNT(*) FROM screenings s2 WHERE s2.match_id = m.id) AS m_bar_count
       FROM screenings s
       JOIN matches m ON m.id = s.match_id
       JOIN competitions c ON c.id = m.competition_id
       WHERE ${where.join(" AND ")}
       ORDER BY m.starts_at`,
    )
    .all(...(params as never[])) as FlatRow[];

  return result.map((r) => ({
    id: r.id as number,
    bar_id: r.bar_id as number,
    match_id: r.match_id as number,
    sound_on: r.sound_on as number,
    screens: r.screens as number,
    reservation_required: r.reservation_required as number,
    promo: (r.promo as string) ?? null,
    note: (r.note as string) ?? null,
    created_at: r.created_at as string,
    going: Number(r.going),
    match: {
      id: r.m_id as number,
      competition_id: r.m_competition_id as number,
      home_team: r.m_home_team as string,
      away_team: r.m_away_team as string,
      starts_at: r.m_starts_at as string,
      channel: (r.m_channel as string) ?? null,
      round: (r.m_round as string) ?? null,
      competition_name: r.m_competition_name as string,
      competition_emoji: r.m_competition_emoji as string,
      sport: r.m_sport as Sport,
      bar_count: Number(r.m_bar_count),
    },
  }));
}

export interface BarListItem extends Bar {
  upcoming: number;
}

export function listBars(filters: { city?: string; q?: string } = {}): BarListItem[] {
  const where: string[] = [];
  const params: unknown[] = [new Date().toISOString()];

  if (filters.city) {
    where.push("b.city = ?");
    params.push(filters.city);
  }
  if (filters.q) {
    where.push("(b.name LIKE ? OR b.address LIKE ? OR b.city LIKE ?)");
    params.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
  }

  const sql = `
    SELECT b.*,
           (SELECT COUNT(*) FROM screenings s JOIN matches m ON m.id = s.match_id
            WHERE s.bar_id = b.id AND m.starts_at >= ?) AS upcoming
    FROM bars b
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY upcoming DESC, b.name`;

  return rows<BarListItem>(db.prepare(sql).all(...(params as never[])));
}

export function getBarBySlug(slug: string): Bar | null {
  return row<Bar>(db.prepare(`SELECT * FROM bars WHERE slug = ?`).get(slug));
}

export function getBarById(id: number): Bar | null {
  return row<Bar>(db.prepare(`SELECT * FROM bars WHERE id = ?`).get(id));
}

/** Partidos que un bar todavía puede añadir a su agenda, marcando los ya anunciados. */
export function listMatchesForBar(
  barId: number,
  sport?: Sport,
): (MatchListItem & { announced: boolean })[] {
  const params: unknown[] = [new Date().toISOString()];
  let sportClause = "";
  if (sport) {
    sportClause = " AND c.sport = ?";
    params.push(sport);
  }

  const result = db
    .prepare(
      `${MATCH_SELECT}
       WHERE m.starts_at >= ?${sportClause}
       ORDER BY m.starts_at LIMIT 60`,
    )
    .all(...(params as never[])) as FlatRow[];

  const announced = new Set(
    (db.prepare(`SELECT match_id FROM screenings WHERE bar_id = ?`).all(barId) as {
      match_id: number;
    }[]).map((r) => r.match_id),
  );

  return result.map((r) => ({
    ...(r as unknown as MatchListItem),
    bar_count: Number(r.bar_count),
    announced: announced.has(r.id as number),
  }));
}

/* --------------------------------- Asistencia -------------------------------- */

export function toggleAttendance(
  screeningId: number,
  visitorId: string,
): { going: boolean; count: number } {
  const exists = db
    .prepare(`SELECT 1 AS ok FROM attendances WHERE screening_id = ? AND visitor_id = ?`)
    .get(screeningId, visitorId);

  if (exists) {
    db.prepare(`DELETE FROM attendances WHERE screening_id = ? AND visitor_id = ?`).run(
      screeningId,
      visitorId,
    );
  } else {
    db.prepare(
      `INSERT INTO attendances (screening_id, visitor_id, created_at) VALUES (?, ?, ?)`,
    ).run(screeningId, visitorId, new Date().toISOString());
  }

  const count = db
    .prepare(`SELECT COUNT(*) AS n FROM attendances WHERE screening_id = ?`)
    .get(screeningId) as { n: number };

  return { going: !exists, count: Number(count.n) };
}

export function attendanceOf(visitorId: string, screeningIds: number[]): Set<number> {
  if (!visitorId || screeningIds.length === 0) return new Set();
  const placeholders = screeningIds.map(() => "?").join(", ");
  const result = db
    .prepare(
      `SELECT screening_id FROM attendances
       WHERE visitor_id = ? AND screening_id IN (${placeholders})`,
    )
    .all(...([visitorId, ...screeningIds] as never[])) as { screening_id: number }[];
  return new Set(result.map((r) => r.screening_id));
}

/* --------------------------- Mutaciones del panel --------------------------- */

export interface ScreeningInput {
  soundOn: boolean;
  screens: number;
  reservationRequired: boolean;
  promo: string | null;
  note: string | null;
}

export function upsertScreening(barId: number, matchId: number, input: ScreeningInput) {
  db.prepare(
    `INSERT INTO screenings
       (bar_id, match_id, sound_on, screens, reservation_required, promo, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (bar_id, match_id) DO UPDATE SET
       sound_on = excluded.sound_on,
       screens = excluded.screens,
       reservation_required = excluded.reservation_required,
       promo = excluded.promo,
       note = excluded.note`,
  ).run(
    barId,
    matchId,
    input.soundOn ? 1 : 0,
    input.screens,
    input.reservationRequired ? 1 : 0,
    input.promo,
    input.note,
    new Date().toISOString(),
  );
}

export function deleteScreening(screeningId: number, barId: number) {
  db.prepare(`DELETE FROM screenings WHERE id = ? AND bar_id = ?`).run(screeningId, barId);
}

export interface BarProfileInput {
  name: string;
  city: string;
  address: string;
  phone: string | null;
  description: string | null;
  screens: number;
  hasTerrace: boolean;
  hasFood: boolean;
  acceptsReservations: boolean;
}

export function updateBarProfile(barId: number, input: BarProfileInput) {
  db.prepare(
    `UPDATE bars SET name = ?, city = ?, address = ?, phone = ?, description = ?,
                     screens = ?, has_terrace = ?, has_food = ?, accepts_reservations = ?
     WHERE id = ?`,
  ).run(
    input.name,
    input.city,
    input.address,
    input.phone,
    input.description,
    input.screens,
    input.hasTerrace ? 1 : 0,
    input.hasFood ? 1 : 0,
    input.acceptsReservations ? 1 : 0,
    barId,
  );
}
