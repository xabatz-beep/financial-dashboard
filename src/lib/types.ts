export type Sport = "futbol" | "baloncesto";

export const SPORTS: { id: Sport; label: string; emoji: string }[] = [
  { id: "futbol", label: "Fútbol", emoji: "⚽" },
  { id: "baloncesto", label: "Baloncesto", emoji: "🏀" },
];

export interface Competition {
  id: number;
  slug: string;
  name: string;
  sport: Sport;
  emoji: string;
}

export interface Match {
  id: number;
  competition_id: number;
  home_team: string;
  away_team: string;
  starts_at: string; // ISO 8601 en UTC
  channel: string | null;
  round: string | null;
}

export interface MatchListItem extends Match {
  competition_name: string;
  competition_emoji: string;
  sport: Sport;
  bar_count: number;
}

export interface Bar {
  id: number;
  slug: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  description: string | null;
  screens: number;
  has_terrace: number;
  has_food: number;
  accepts_reservations: number;
  accent: string;
}

export interface Screening {
  id: number;
  bar_id: number;
  match_id: number;
  sound_on: number;
  screens: number;
  reservation_required: number;
  promo: string | null;
  note: string | null;
  created_at: string;
}

/** Una emisión con los datos del bar que la organiza. */
export interface ScreeningWithBar extends Screening {
  bar: Bar;
  going: number;
}

/** Una emisión con los datos del partido, para la agenda de un bar. */
export interface ScreeningWithMatch extends Screening {
  match: MatchListItem;
  going: number;
}

export interface Owner {
  id: number;
  email: string;
  name: string;
  bar_id: number;
}
