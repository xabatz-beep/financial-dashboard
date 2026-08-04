/** Esquema de la base de datos. Se aplica en cada arranque (todo es IF NOT EXISTS). */
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS competitions (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sport TEXT NOT NULL CHECK (sport IN ('futbol', 'baloncesto')),
  emoji TEXT NOT NULL DEFAULT '🏆'
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY,
  competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  channel TEXT,
  round TEXT,
  UNIQUE (home_team, away_team, starts_at)
);
CREATE INDEX IF NOT EXISTS idx_matches_starts_at ON matches (starts_at);

CREATE TABLE IF NOT EXISTS bars (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  phone TEXT,
  description TEXT,
  screens INTEGER NOT NULL DEFAULT 1,
  has_terrace INTEGER NOT NULL DEFAULT 0,
  has_food INTEGER NOT NULL DEFAULT 0,
  accepts_reservations INTEGER NOT NULL DEFAULT 0,
  accent TEXT NOT NULL DEFAULT 'verde'
);
CREATE INDEX IF NOT EXISTS idx_bars_city ON bars (city);

CREATE TABLE IF NOT EXISTS screenings (
  id INTEGER PRIMARY KEY,
  bar_id INTEGER NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sound_on INTEGER NOT NULL DEFAULT 0,
  screens INTEGER NOT NULL DEFAULT 1,
  reservation_required INTEGER NOT NULL DEFAULT 0,
  promo TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (bar_id, match_id)
);
CREATE INDEX IF NOT EXISTS idx_screenings_match ON screenings (match_id);
CREATE INDEX IF NOT EXISTS idx_screenings_bar ON screenings (bar_id);

CREATE TABLE IF NOT EXISTS attendances (
  screening_id INTEGER NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (screening_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS owners (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  bar_id INTEGER NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
`;
