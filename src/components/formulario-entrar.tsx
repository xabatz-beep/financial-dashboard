"use client";

import { useActionState } from "react";
import { accionEntrar, type EstadoFormulario } from "@/app/panel/actions";

const INICIAL: EstadoFormulario = {};

export function FormularioEntrar() {
  const [estado, accion, pendiente] = useActionState(accionEntrar, INICIAL);

  return (
    <form action={accion} className="space-y-4">
      <div>
        <label className="etiqueta" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue="demo@elpenalti.es"
          className="campo"
        />
      </div>

      <div>
        <label className="etiqueta" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          defaultValue="partido2026"
          className="campo"
        />
      </div>

      {estado.error && (
        <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {estado.error}
        </p>
      )}

      <button type="submit" disabled={pendiente} className="boton-primario w-full">
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
