import { NextResponse } from "next/server";
import { ensureVisitorId } from "@/lib/auth";
import { db } from "@/lib/db";
import { toggleAttendance } from "@/lib/queries";

/** Marca o desmarca "voy" en una emisión. La identidad es una cookie anónima. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { screeningId?: number } | null;
  const screeningId = Number(body?.screeningId);

  if (!Number.isInteger(screeningId)) {
    return NextResponse.json({ error: "Falta la emisión" }, { status: 400 });
  }
  if (!db.prepare(`SELECT 1 AS ok FROM screenings WHERE id = ?`).get(screeningId)) {
    return NextResponse.json({ error: "Esa emisión no existe" }, { status: 404 });
  }

  const visitante = await ensureVisitorId();
  return NextResponse.json(toggleAttendance(screeningId, visitante));
}
