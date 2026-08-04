"use client";

import { useActionState } from "react";
import { accionGuardarPerfil, type EstadoFormulario } from "@/app/panel/actions";
import { NOMBRES_CIUDADES } from "@/lib/ciudades";
import type { Bar } from "@/lib/types";

const INICIAL: EstadoFormulario = {};

export function FormularioPerfil({ bar }: { bar: Bar }) {
  const [estado, accion, pendiente] = useActionState(accionGuardarPerfil, INICIAL);

  return (
    <form action={accion} className="space-y-4">
      <div>
        <label className="etiqueta" htmlFor="name">
          Nombre del bar
        </label>
        <input id="name" name="name" required defaultValue={bar.name} className="campo" />
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
            list="ciudades-perfil"
            defaultValue={bar.city}
            className="campo"
          />
          <datalist id="ciudades-perfil">
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
            defaultValue={bar.address}
            className="campo"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="phone">
            Teléfono
          </label>
          <input id="phone" name="phone" defaultValue={bar.phone ?? ""} className="campo" />
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
            defaultValue={bar.screens}
            className="campo"
          />
        </div>
      </div>

      <div>
        <label className="etiqueta" htmlFor="description">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={400}
          defaultValue={bar.description ?? ""}
          className="campo"
        />
      </div>

      <fieldset className="flex flex-wrap gap-4">
        <legend className="etiqueta">Servicios</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="hasTerrace"
            defaultChecked={bar.has_terrace === 1}
            className="size-4 accent-[#22c55e]"
          />
          Terraza
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="hasFood"
            defaultChecked={bar.has_food === 1}
            className="size-4 accent-[#22c55e]"
          />
          Cocina
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="acceptsReservations"
            defaultChecked={bar.accepts_reservations === 1}
            className="size-4 accent-[#22c55e]"
          />
          Acepta reservas
        </label>
      </fieldset>

      {estado.error && (
        <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {estado.error}
        </p>
      )}
      {estado.ok && (
        <p className="rounded-xl border border-cesped/30 bg-cesped/10 px-3 py-2 text-sm text-cesped">
          Guardado. Tu ficha pública ya está actualizada.
        </p>
      )}

      <button type="submit" disabled={pendiente} className="boton-primario">
        {pendiente ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
