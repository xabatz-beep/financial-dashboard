"use client";

import { useActionState, useState } from "react";
import { accionAlta, type EstadoFormulario } from "@/app/panel/actions";
import { NOMBRES_CIUDADES } from "@/lib/ciudades";

const INICIAL: EstadoFormulario = {};

export function FormularioAlta() {
  const [estado, accion, pendiente] = useActionState(accionAlta, INICIAL);
  const [posicion, setPosicion] = useState<{ lat: number; lng: number } | null>(null);
  const [avisoUbicacion, setAvisoUbicacion] = useState<string | null>(null);

  function usarUbicacion() {
    if (!("geolocation" in navigator)) {
      setAvisoUbicacion("Tu navegador no permite compartir la ubicación.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosicion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAvisoUbicacion(null);
      },
      () => setAvisoUbicacion("No hemos podido leer tu ubicación; usaremos el centro de la ciudad."),
      { timeout: 8000 },
    );
  }

  return (
    <form action={accion} className="space-y-4">
      <input type="hidden" name="lat" value={posicion?.lat ?? ""} />
      <input type="hidden" name="lng" value={posicion?.lng ?? ""} />

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-300">Tu bar</legend>

        <div>
          <label className="etiqueta" htmlFor="barName">
            Nombre del bar
          </label>
          <input id="barName" name="barName" required className="campo" placeholder="La Grada" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="city">
              Ciudad
            </label>
            <input
              id="city"
              name="city"
              required
              list="ciudades"
              className="campo"
              placeholder="Bilbao"
            />
            <datalist id="ciudades">
              {NOMBRES_CIUDADES.map((nombre) => (
                <option key={nombre} value={nombre} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="etiqueta" htmlFor="address">
              Dirección
            </label>
            <input
              id="address"
              name="address"
              required
              className="campo"
              placeholder="Calle Mayor, 3"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="phone">
              Teléfono (opcional)
            </label>
            <input id="phone" name="phone" className="campo" placeholder="944 00 00 00" />
          </div>
          <div>
            <label className="etiqueta" htmlFor="screens">
              Pantallas
            </label>
            <input
              id="screens"
              name="screens"
              type="number"
              min={1}
              max={30}
              defaultValue={2}
              className="campo"
            />
          </div>
        </div>

        <div>
          <label className="etiqueta" htmlFor="description">
            Cómo es tu bar (opcional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={400}
            className="campo"
            placeholder="Bar de barrio con proyector, cocina hasta medianoche y terraza."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={usarUbicacion} className="boton-secundario">
            📍 Usar mi ubicación
          </button>
          <span className="text-sm text-slate-400">
            {posicion
              ? `Ubicación guardada (${posicion.lat.toFixed(4)}, ${posicion.lng.toFixed(4)})`
              : "Si no la compartes usaremos el centro de la ciudad."}
          </span>
        </div>
        {avisoUbicacion && <p className="text-sm text-amber-300">{avisoUbicacion}</p>}
      </fieldset>

      <fieldset className="space-y-4 border-t border-white/10 pt-4">
        <legend className="text-sm font-semibold text-slate-300">Tu cuenta</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="ownerName">
              Tu nombre
            </label>
            <input id="ownerName" name="ownerName" className="campo" placeholder="Marta" />
          </div>
          <div>
            <label className="etiqueta" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="campo"
            />
          </div>
        </div>

        <div>
          <label className="etiqueta" htmlFor="password">
            Contraseña (mínimo 8 caracteres)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="campo"
          />
        </div>
      </fieldset>

      {estado.error && (
        <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {estado.error}
        </p>
      )}

      <button type="submit" disabled={pendiente} className="boton-primario w-full">
        {pendiente ? "Creando tu bar…" : "Crear cuenta y publicar mi agenda"}
      </button>
    </form>
  );
}
