"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentSession, login, logout, registerBar } from "@/lib/auth";
import { CIUDADES } from "@/lib/ciudades";
import { deleteScreening, updateBarProfile, upsertScreening } from "@/lib/queries";

export interface EstadoFormulario {
  error?: string;
  ok?: boolean;
}

function texto(formData: FormData, clave: string): string {
  return String(formData.get(clave) ?? "").trim();
}

function opcional(formData: FormData, clave: string): string | null {
  return texto(formData, clave) || null;
}

function bandera(formData: FormData, clave: string): boolean {
  const valor = formData.get(clave);
  return valor === "on" || valor === "1" || valor === "true";
}

function numero(formData: FormData, clave: string, porDefecto: number): number {
  const valor = Number(formData.get(clave));
  return Number.isFinite(valor) && valor > 0 ? Math.round(valor) : porDefecto;
}

export async function accionEntrar(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = texto(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Escribe tu correo y tu contraseña." };
  if (!(await login(email, password))) {
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect("/panel");
}

export async function accionSalir() {
  await logout();
  redirect("/panel");
}

export async function accionAlta(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = texto(formData, "email");
  const password = String(formData.get("password") ?? "");
  const barName = texto(formData, "barName");
  const city = texto(formData, "city");
  const address = texto(formData, "address");

  if (!barName || !city || !address) {
    return { error: "Necesitamos el nombre del bar, la ciudad y la dirección." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Ese correo no parece válido." };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const centro = CIUDADES[city] ?? { lat: 40.4168, lng: -3.7038 };
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));

  const resultado = await registerBar({
    email,
    password,
    ownerName: texto(formData, "ownerName") || barName,
    barName,
    city,
    address,
    lat: Number.isFinite(lat) && lat !== 0 ? lat : centro.lat,
    lng: Number.isFinite(lng) && lng !== 0 ? lng : centro.lng,
    phone: opcional(formData, "phone"),
    description: opcional(formData, "description"),
    screens: numero(formData, "screens", 1),
  });

  if (resultado.error) return { error: resultado.error };

  revalidatePath("/bares");
  redirect("/panel");
}

export async function accionGuardarEmision(formData: FormData) {
  const sesion = await currentSession();
  if (!sesion) redirect("/panel");

  const matchId = Number(formData.get("matchId"));
  if (!Number.isInteger(matchId)) return;

  upsertScreening(sesion.bar.id, matchId, {
    soundOn: bandera(formData, "soundOn"),
    screens: Math.min(numero(formData, "screens", 1), sesion.bar.screens),
    reservationRequired: bandera(formData, "reservationRequired"),
    promo: opcional(formData, "promo"),
    note: opcional(formData, "note"),
  });

  revalidatePath("/panel");
  revalidatePath(`/partidos/${matchId}`);
  revalidatePath(`/bares/${sesion.bar.slug}`);
  revalidatePath("/");
}

export async function accionBorrarEmision(formData: FormData) {
  const sesion = await currentSession();
  if (!sesion) redirect("/panel");

  const screeningId = Number(formData.get("screeningId"));
  const matchId = Number(formData.get("matchId"));
  if (!Number.isInteger(screeningId)) return;

  deleteScreening(screeningId, sesion.bar.id);

  revalidatePath("/panel");
  if (Number.isInteger(matchId)) revalidatePath(`/partidos/${matchId}`);
  revalidatePath(`/bares/${sesion.bar.slug}`);
  revalidatePath("/");
}

export async function accionGuardarPerfil(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const sesion = await currentSession();
  if (!sesion) redirect("/panel");

  const name = texto(formData, "name");
  const city = texto(formData, "city");
  const address = texto(formData, "address");
  if (!name || !city || !address) {
    return { error: "El nombre, la ciudad y la dirección son obligatorios." };
  }

  updateBarProfile(sesion.bar.id, {
    name,
    city,
    address,
    phone: opcional(formData, "phone"),
    description: opcional(formData, "description"),
    screens: numero(formData, "screens", 1),
    hasTerrace: bandera(formData, "hasTerrace"),
    hasFood: bandera(formData, "hasFood"),
    acceptsReservations: bandera(formData, "acceptsReservations"),
  });

  revalidatePath("/panel");
  revalidatePath("/bares");
  revalidatePath(`/bares/${sesion.bar.slug}`);
  return { ok: true };
}
