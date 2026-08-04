import type { DatabaseSync } from "node:sqlite";
import { madridIso } from "./format";
import { hashPassword } from "./password";

/**
 * Datos de demostración. Los partidos se generan siempre relativos al día de hoy,
 * así que la agenda nunca aparece vacía: si ya no queda ningún partido futuro se
 * regenera el calendario (y con él las emisiones de ejemplo).
 */

const COMPETITIONS = [
  { slug: "laliga", name: "LaLiga EA Sports", sport: "futbol", emoji: "🇪🇸" },
  { slug: "champions", name: "UEFA Champions League", sport: "futbol", emoji: "⭐" },
  { slug: "copa", name: "Copa del Rey", sport: "futbol", emoji: "🏆" },
  { slug: "premier", name: "Premier League", sport: "futbol", emoji: "🏴" },
  { slug: "acb", name: "Liga Endesa ACB", sport: "baloncesto", emoji: "🇪🇸" },
  { slug: "euroliga", name: "Euroliga", sport: "baloncesto", emoji: "⭐" },
  { slug: "nba", name: "NBA", sport: "baloncesto", emoji: "🇺🇸" },
] as const;

const BARS = [
  {
    slug: "la-grada-deusto",
    name: "La Grada de Deusto",
    city: "Bilbao",
    address: "Ribera de Deusto, 14",
    lat: 43.2716,
    lng: -2.9455,
    phone: "944 11 22 33",
    description:
      "Bar de barrio de toda la vida con tres pantallas y una grada de verdad rescatada de San Mamés. Cuando juega el Athletic esto es una caldera.",
    screens: 3,
    has_terrace: 1,
    has_food: 1,
    accepts_reservations: 1,
    accent: "rojo",
  },
  {
    slug: "txoko-athletic",
    name: "Txoko Athletic",
    city: "Bilbao",
    address: "Calle Hernani, 5",
    lat: 43.2545,
    lng: -2.9245,
    phone: "944 55 66 77",
    description:
      "Txoko reconvertido en bar de partidos. Pintxos caseros, sidra y un proyector de 150 pulgadas.",
    screens: 2,
    has_terrace: 0,
    has_food: 1,
    accepts_reservations: 1,
    accent: "verde",
  },
  {
    slug: "kana-y-triple",
    name: "Kaña & Triple",
    city: "Bilbao",
    address: "Alameda de Urquijo, 62",
    lat: 43.2611,
    lng: -2.9407,
    phone: "946 00 11 22",
    description:
      "Especialistas en baloncesto: ACB, Euroliga y NBA de madrugada con desayuno incluido.",
    screens: 4,
    has_terrace: 0,
    has_food: 0,
    accepts_reservations: 0,
    accent: "ambar",
  },
  {
    slug: "el-penalti",
    name: "El Penalti",
    city: "Madrid",
    address: "Calle del Pez, 21",
    lat: 40.4256,
    lng: -3.7045,
    phone: "915 22 33 44",
    description:
      "Clásico de Malasaña. Seis pantallas repartidas, sonido del partido principal y cañas a precio de barrio.",
    screens: 6,
    has_terrace: 1,
    has_food: 1,
    accepts_reservations: 1,
    accent: "verde",
  },
  {
    slug: "la-prorroga",
    name: "La Prórroga",
    city: "Madrid",
    address: "Calle de Fuencarral, 130",
    lat: 40.434,
    lng: -3.7039,
    phone: "915 88 99 00",
    description:
      "Sala grande con dos zonas: una con sonido y otra tranquila para los que solo quieren ver el partido.",
    screens: 4,
    has_terrace: 0,
    has_food: 1,
    accepts_reservations: 1,
    accent: "azul",
  },
  {
    slug: "tapas-y-triples",
    name: "Tapas & Triples",
    city: "Madrid",
    address: "Calle de Argumosa, 9",
    lat: 40.409,
    lng: -3.7009,
    phone: "910 12 34 56",
    description:
      "Lavapiés, cocina hasta la medianoche y pantalla dedicada al baloncesto siempre que hay ACB o Euroliga.",
    screens: 3,
    has_terrace: 1,
    has_food: 1,
    accepts_reservations: 0,
    accent: "ambar",
  },
  {
    slug: "corner-chamartin",
    name: "Córner Chamartín",
    city: "Madrid",
    address: "Avenida de Concha Espina, 40",
    lat: 40.453,
    lng: -3.6883,
    phone: "914 77 88 99",
    description:
      "A cinco minutos del estadio. Se llena en días de Champions, mejor reservar.",
    screens: 5,
    has_terrace: 1,
    has_food: 1,
    accepts_reservations: 1,
    accent: "violeta",
  },
  {
    slug: "el-corner-del-born",
    name: "El Córner del Born",
    city: "Barcelona",
    address: "Carrer del Rec, 24",
    lat: 41.3852,
    lng: 2.183,
    phone: "932 10 20 30",
    description:
      "Cervezas artesanas y partido en pantalla de 110''. Ambiente internacional, comentarios en inglés algunos días.",
    screens: 2,
    has_terrace: 1,
    has_food: 1,
    accepts_reservations: 1,
    accent: "azul",
  },
  {
    slug: "gracia-sports-bar",
    name: "Gràcia Sports Bar",
    city: "Barcelona",
    address: "Carrer de Verdi, 61",
    lat: 41.4036,
    lng: 2.156,
    phone: "934 55 66 77",
    description:
      "Bar pequeño y ruidoso. Sonido siempre encendido y bufandas del Barça por todas partes.",
    screens: 2,
    has_terrace: 0,
    has_food: 0,
    accepts_reservations: 0,
    accent: "rojo",
  },
  {
    slug: "cerveses-i-basquet",
    name: "Cerveses i Bàsquet",
    city: "Barcelona",
    address: "Carrer de Sants, 132",
    lat: 41.3757,
    lng: 2.133,
    phone: "936 11 22 33",
    description:
      "Templo del baloncesto en Sants: Euroliga, ACB y noches de NBA con maratón hasta las cuatro.",
    screens: 4,
    has_terrace: 0,
    has_food: 1,
    accepts_reservations: 1,
    accent: "ambar",
  },
  {
    slug: "el-tunel-de-mestalla",
    name: "El Túnel de Mestalla",
    city: "Valencia",
    address: "Avinguda d'Aragó, 18",
    lat: 39.475,
    lng: -0.3583,
    phone: "963 22 33 44",
    description:
      "Al lado del estadio. Terraza enorme con dos proyectores y almuerzo valenciano antes del partido.",
    screens: 4,
    has_terrace: 1,
    has_food: 1,
    accepts_reservations: 1,
    accent: "verde",
  },
  {
    slug: "ruzafa-sports-corner",
    name: "Ruzafa Sports Corner",
    city: "Valencia",
    address: "Carrer de Cadis, 45",
    lat: 39.4622,
    lng: -0.3742,
    phone: "960 55 44 33",
    description:
      "Ambiente joven, cerveza barata y una pantalla por deporte cuando coinciden fútbol y basket.",
    screens: 3,
    has_terrace: 1,
    has_food: 0,
    accepts_reservations: 0,
    accent: "violeta",
  },
  {
    slug: "la-grada-de-triana",
    name: "La Grada de Triana",
    city: "Sevilla",
    address: "Calle Betis, 31",
    lat: 37.384,
    lng: -6.002,
    phone: "954 11 22 33",
    description:
      "Con vistas al Guadalquivir. Pantalla en la terraza y montaditos durante el descanso.",
    screens: 3,
    has_terrace: 1,
    has_food: 1,
    accepts_reservations: 1,
    accent: "verde",
  },
  {
    slug: "nervion-gol",
    name: "Nervión Gol",
    city: "Sevilla",
    address: "Avenida de Eduardo Dato, 70",
    lat: 37.384,
    lng: -5.97,
    phone: "955 66 77 88",
    description:
      "Bar de barrio con seis pantallas y horario ampliado los días de competición europea.",
    screens: 6,
    has_terrace: 0,
    has_food: 1,
    accepts_reservations: 1,
    accent: "rojo",
  },
] as const;

interface Fixture {
  competition: (typeof COMPETITIONS)[number]["slug"];
  home: string;
  away: string;
  /** Días desde hoy. */
  day: number;
  /** Hora española "HH:MM". Se ignora cuando `day` es 0. */
  time: string;
  /** Para los partidos de hoy: minutos desde ahora, para que siempre estén por jugarse. */
  inMinutes?: number;
  channel: string;
  round?: string;
}

const FIXTURES: Fixture[] = [
  // Hoy
  { competition: "laliga", home: "Athletic Club", away: "Real Sociedad", day: 0, time: "21:00", inMinutes: 100, channel: "Movistar LaLiga", round: "Jornada 24" },
  { competition: "acb", home: "Bilbao Basket", away: "Valencia Basket", day: 0, time: "20:30", inMinutes: 190, channel: "DAZN", round: "Jornada 21" },
  { competition: "champions", home: "Real Madrid", away: "Bayern de Múnich", day: 0, time: "21:00", inMinutes: 260, channel: "Movistar Liga de Campeones", round: "Octavos · ida" },
  { competition: "nba", home: "Los Angeles Lakers", away: "Boston Celtics", day: 0, time: "03:00", inMinutes: 480, channel: "Movistar Deportes", round: "Temporada regular" },

  // Mañana
  { competition: "champions", home: "FC Barcelona", away: "Inter de Milán", day: 1, time: "21:00", channel: "Movistar Liga de Campeones", round: "Octavos · ida" },
  { competition: "champions", home: "Atlético de Madrid", away: "Paris Saint-Germain", day: 1, time: "18:45", channel: "Movistar Liga de Campeones", round: "Octavos · ida" },
  { competition: "euroliga", home: "Real Madrid", away: "Panathinaikos", day: 1, time: "20:45", channel: "Movistar Deportes", round: "Jornada 27" },

  { competition: "champions", home: "Athletic Club", away: "Arsenal", day: 2, time: "21:00", channel: "Movistar Liga de Campeones", round: "Octavos · ida" },
  { competition: "euroliga", home: "FC Barcelona", away: "Fenerbahce", day: 2, time: "20:30", channel: "Movistar Deportes", round: "Jornada 27" },
  { competition: "premier", home: "Liverpool", away: "Manchester City", day: 2, time: "21:00", channel: "DAZN", round: "Jornada 27" },

  { competition: "copa", home: "Valencia CF", away: "Sevilla FC", day: 3, time: "21:30", channel: "RTVE La 1", round: "Semifinal · vuelta" },
  { competition: "euroliga", home: "Baskonia", away: "Olympiacos", day: 3, time: "20:30", channel: "Movistar Deportes", round: "Jornada 27" },

  // Fin de semana
  { competition: "laliga", home: "Real Betis", away: "Villarreal CF", day: 4, time: "14:00", channel: "DAZN LaLiga", round: "Jornada 25" },
  { competition: "laliga", home: "Girona FC", away: "Rayo Vallecano", day: 4, time: "16:15", channel: "Movistar LaLiga", round: "Jornada 25" },
  { competition: "laliga", home: "Real Madrid", away: "Atlético de Madrid", day: 4, time: "21:00", channel: "Movistar LaLiga", round: "Jornada 25 · derbi" },
  { competition: "acb", home: "Real Madrid", away: "Unicaja", day: 4, time: "18:00", channel: "DAZN", round: "Jornada 22" },
  { competition: "premier", home: "Arsenal", away: "Chelsea", day: 4, time: "18:30", channel: "DAZN", round: "Jornada 28" },

  { competition: "laliga", home: "FC Barcelona", away: "Valencia CF", day: 5, time: "18:30", channel: "Movistar LaLiga", round: "Jornada 25" },
  { competition: "laliga", home: "Sevilla FC", away: "Athletic Club", day: 5, time: "21:00", channel: "DAZN LaLiga", round: "Jornada 25" },
  { competition: "acb", home: "FC Barcelona", away: "Joventut", day: 5, time: "12:30", channel: "Teledeporte", round: "Jornada 22" },
  { competition: "acb", home: "Valencia Basket", away: "Gran Canaria", day: 5, time: "17:00", channel: "DAZN", round: "Jornada 22" },
  { competition: "nba", home: "Golden State Warriors", away: "Denver Nuggets", day: 5, time: "02:30", channel: "Movistar Deportes", round: "Temporada regular" },

  { competition: "champions", home: "Manchester City", away: "Real Sociedad", day: 7, time: "21:00", channel: "Movistar Liga de Campeones", round: "Octavos · vuelta" },
  { competition: "euroliga", home: "Valencia Basket", away: "Zalgiris", day: 8, time: "20:30", channel: "Movistar Deportes", round: "Jornada 28" },
  { competition: "copa", home: "Real Madrid", away: "Getafe CF", day: 8, time: "21:30", channel: "RTVE La 1", round: "Semifinal · vuelta" },
  { competition: "laliga", home: "Osasuna", away: "Celta de Vigo", day: 9, time: "19:00", channel: "Movistar LaLiga", round: "Jornada 26" },
];

const PROMOS = [
  "2 cañas + tapa por 6 €",
  "Jarra de un litro a 5 € durante el partido",
  "Bocata + bebida por 7,50 €",
  "Nachos gratis si marca el equipo local",
  "Cubo de 5 tercios por 10 €",
  "20 % de descuento si vienes con la camiseta",
  "Menú partido: hamburguesa, patatas y caña 12 €",
  null,
  null,
];

const NOTES = [
  "Guardamos la mesa hasta 15 minutos antes del inicio.",
  "Pantalla grande en la sala del fondo.",
  "Proyector en la terraza si no llueve.",
  "Ambiente familiar, se puede venir con niños.",
  "Abrimos una hora antes del partido.",
  null,
];

function countRow(db: DatabaseSync, sql: string, ...params: unknown[]): number {
  const row = db.prepare(sql).get(...(params as never[])) as { n: number };
  return Number(row.n);
}

function seedCompetitions(db: DatabaseSync) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO competitions (slug, name, sport, emoji) VALUES (?, ?, ?, ?)`,
  );
  for (const c of COMPETITIONS) insert.run(c.slug, c.name, c.sport, c.emoji);
}

function seedBars(db: DatabaseSync) {
  if (countRow(db, `SELECT COUNT(*) AS n FROM bars`) > 0) return;

  const insert = db.prepare(
    `INSERT INTO bars (slug, name, city, address, lat, lng, phone, description,
                       screens, has_terrace, has_food, accepts_reservations, accent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const b of BARS) {
    insert.run(
      b.slug, b.name, b.city, b.address, b.lat, b.lng, b.phone, b.description,
      b.screens, b.has_terrace, b.has_food, b.accepts_reservations, b.accent,
    );
  }

  // Cuenta de demostración para probar el panel del bar.
  const bar = db.prepare(`SELECT id FROM bars WHERE slug = ?`).get("el-penalti") as { id: number };
  db.prepare(
    `INSERT OR IGNORE INTO owners (email, name, password_hash, bar_id, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(
    "demo@elpenalti.es",
    "Marta (El Penalti)",
    hashPassword("partido2026"),
    bar.id,
    new Date().toISOString(),
  );
}

function fixtureIso(fixture: Fixture, now: Date): string {
  if (fixture.day === 0 && fixture.inMinutes != null) {
    const at = new Date(now.getTime() + fixture.inMinutes * 60_000);
    at.setUTCSeconds(0, 0);
    at.setUTCMinutes(Math.round(at.getUTCMinutes() / 15) * 15);
    return at.toISOString();
  }
  const base = new Date(now.getTime() + fixture.day * 86_400_000);
  const [hour, minute] = fixture.time.split(":").map(Number);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(base);
  const [y, m, d] = parts.split("-").map(Number);
  return madridIso(y, m, d, hour, minute);
}

/** Genera el calendario y reparte emisiones entre los bares de forma reproducible. */
function seedFixtures(db: DatabaseSync) {
  const now = new Date();
  const pending = countRow(
    db,
    `SELECT COUNT(*) AS n FROM matches WHERE starts_at > ?`,
    now.toISOString(),
  );
  if (pending > 0) return;

  db.exec(`DELETE FROM matches`); // arrastra emisiones y asistencias por ON DELETE CASCADE

  const competitionId = new Map<string, number>();
  for (const row of db.prepare(`SELECT id, slug FROM competitions`).all() as {
    id: number;
    slug: string;
  }[]) {
    competitionId.set(row.slug, row.id);
  }

  const insertMatch = db.prepare(
    `INSERT INTO matches (competition_id, home_team, away_team, starts_at, channel, round)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  for (const fixture of FIXTURES) {
    insertMatch.run(
      competitionId.get(fixture.competition)!,
      fixture.home,
      fixture.away,
      fixtureIso(fixture, now),
      fixture.channel,
      fixture.round ?? null,
    );
  }

  const matches = db.prepare(`SELECT id FROM matches ORDER BY id`).all() as { id: number }[];
  const bars = db.prepare(`SELECT id, screens FROM bars ORDER BY id`).all() as {
    id: number;
    screens: number;
  }[];

  const insertScreening = db.prepare(
    `INSERT OR IGNORE INTO screenings
       (bar_id, match_id, sound_on, screens, reservation_required, promo, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertAttendance = db.prepare(
    `INSERT OR IGNORE INTO attendances (screening_id, visitor_id, created_at) VALUES (?, ?, ?)`,
  );
  const createdAt = now.toISOString();

  for (const match of matches) {
    let soundGiven = false;
    for (const bar of bars) {
      const mix = (match.id * 7 + bar.id * 13) % 10;
      if (mix >= 4) continue; // ~40 % de los bares emite cada partido

      const soundOn = !soundGiven || mix % 2 === 0;
      soundGiven = true;
      insertScreening.run(
        bar.id,
        match.id,
        soundOn ? 1 : 0,
        Math.max(1, Math.min(bar.screens, 1 + ((match.id + bar.id) % 3))),
        (match.id + bar.id) % 5 === 0 ? 1 : 0,
        PROMOS[(match.id * 3 + bar.id) % PROMOS.length],
        NOTES[(match.id + bar.id * 2) % NOTES.length],
        createdAt,
      );

      const screening = db
        .prepare(`SELECT id FROM screenings WHERE bar_id = ? AND match_id = ?`)
        .get(bar.id, match.id) as { id: number } | undefined;
      if (!screening) continue;

      const going = (match.id * 5 + bar.id * 3) % 17;
      for (let i = 0; i < going; i++) {
        insertAttendance.run(screening.id, `demo-${screening.id}-${i}`, createdAt);
      }
    }
  }
}

export function seed(db: DatabaseSync) {
  seedCompetitions(db);
  seedBars(db);
  seedFixtures(db);
}
