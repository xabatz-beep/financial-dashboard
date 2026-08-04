import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA } from "./schema";
import { seed } from "./seed";

/**
 * SQLite mediante el módulo nativo `node:sqlite`, sin dependencias externas.
 * La conexión se guarda en `globalThis` para sobrevivir a los recargados en caliente
 * del servidor de desarrollo.
 */
declare global {
  var __dondeLoEchanDb: DatabaseSync | undefined;
}

function connect(): DatabaseSync {
  const dir = process.env.DLE_DATA_DIR ?? path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });

  const database = new DatabaseSync(path.join(dir, "dondeloechan.db"));
  // Durante `next build` varios procesos abren la base a la vez: esperamos en vez de fallar.
  database.exec("PRAGMA busy_timeout = 10000");
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(SCHEMA);

  // La siembra se hace dentro de una transacción para que dos procesos no la dupliquen.
  database.exec("BEGIN IMMEDIATE");
  try {
    seed(database);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }

  return database;
}

export const db: DatabaseSync = (globalThis.__dondeLoEchanDb ??= connect());

/** Las filas de node:sqlite llegan sin prototipo; las normalizamos antes de usarlas en React. */
export function rows<T>(result: unknown[]): T[] {
  return result.map((row) => ({ ...(row as object) })) as T[];
}

export function row<T>(result: unknown): T | null {
  return result ? ({ ...(result as object) } as T) : null;
}
