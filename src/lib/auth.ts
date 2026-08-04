import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db, row } from "./db";
import { hashPassword, verifyPassword } from "./password";
import type { Bar, Owner } from "./types";

const SESSION_COOKIE = "dle_sesion";
const VISITOR_COOKIE = "dle_visitante";
const SESSION_DAYS = 30;

export interface Session {
  owner: Owner;
  bar: Bar;
}

export async function currentSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const record = row<{ owner_id: number; expires_at: string }>(
    db.prepare(`SELECT owner_id, expires_at FROM sessions WHERE token = ?`).get(token),
  );
  if (!record) return null;
  if (record.expires_at < new Date().toISOString()) {
    db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
    return null;
  }

  const owner = row<Owner>(
    db.prepare(`SELECT id, email, name, bar_id FROM owners WHERE id = ?`).get(record.owner_id),
  );
  if (!owner) return null;

  const bar = row<Bar>(db.prepare(`SELECT * FROM bars WHERE id = ?`).get(owner.bar_id));
  if (!bar) return null;

  return { owner, bar };
}

async function startSession(ownerId: number) {
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86_400_000);

  db.prepare(
    `INSERT INTO sessions (token, owner_id, created_at, expires_at) VALUES (?, ?, ?, ?)`,
  ).run(token, ownerId, now.toISOString(), expires.toISOString());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function login(email: string, password: string): Promise<boolean> {
  const owner = row<{ id: number; password_hash: string }>(
    db.prepare(`SELECT id, password_hash FROM owners WHERE email = ?`).get(email.toLowerCase()),
  );
  if (!owner || !verifyPassword(password, owner.password_hash)) return false;

  await startSession(owner.id);
  return true;
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
  jar.delete(SESSION_COOKIE);
}

export interface RegistrationInput {
  email: string;
  password: string;
  ownerName: string;
  barName: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  description: string | null;
  screens: number;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Da de alta un bar y su responsable, y deja la sesión iniciada. */
export async function registerBar(input: RegistrationInput): Promise<{ error?: string }> {
  const email = input.email.toLowerCase();
  const taken = db.prepare(`SELECT 1 AS ok FROM owners WHERE email = ?`).get(email);
  if (taken) return { error: "Ya hay una cuenta con ese correo." };

  let slug = slugify(input.barName) || "bar";
  let suffix = 2;
  while (db.prepare(`SELECT 1 AS ok FROM bars WHERE slug = ?`).get(slug)) {
    slug = `${slugify(input.barName)}-${suffix++}`;
  }

  db.prepare(
    `INSERT INTO bars (slug, name, city, address, lat, lng, phone, description, screens, accent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    slug,
    input.barName,
    input.city,
    input.address,
    input.lat,
    input.lng,
    input.phone,
    input.description,
    input.screens,
    ["verde", "ambar", "azul", "rojo", "violeta"][Math.floor(Math.random() * 5)],
  );

  const bar = row<{ id: number }>(db.prepare(`SELECT id FROM bars WHERE slug = ?`).get(slug))!;
  db.prepare(
    `INSERT INTO owners (email, name, password_hash, bar_id, created_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(email, input.ownerName, hashPassword(input.password), bar.id, new Date().toISOString());

  const owner = row<{ id: number }>(
    db.prepare(`SELECT id FROM owners WHERE email = ?`).get(email),
  )!;
  await startSession(owner.id);
  return {};
}

/* ------------------------------ Visitantes ------------------------------ */

/** Identificador anónimo para recordar a qué emisiones ha dicho "voy" cada persona. */
export async function readVisitorId(): Promise<string> {
  return (await cookies()).get(VISITOR_COOKIE)?.value ?? "";
}

/** Igual que `readVisitorId`, pero crea la cookie si falta. Solo en acciones y rutas. */
export async function ensureVisitorId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const id = randomBytes(16).toString("hex");
  jar.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + 365 * 86_400_000),
  });
  return id;
}
