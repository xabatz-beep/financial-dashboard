"use client";

import { useState, useTransition } from "react";

export function BotonVoy({
  screeningId,
  going,
  count,
}: {
  screeningId: number;
  going: boolean;
  count: number;
}) {
  const [estado, setEstado] = useState({ going, count });
  const [pendiente, startTransition] = useTransition();

  function alternar() {
    startTransition(async () => {
      const respuesta = await fetch("/api/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screeningId }),
      });
      if (!respuesta.ok) return;
      setEstado(await respuesta.json());
    });
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={pendiente}
      aria-pressed={estado.going}
      className={`boton px-3 py-2 text-xs ${
        estado.going
          ? "bg-cesped text-noche-950 hover:bg-cesped/90"
          : "border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10"
      }`}
    >
      {estado.going ? "✓ Voy" : "Voy"}
      <span className={estado.going ? "text-noche-950/70" : "text-slate-400"}>
        {estado.count}
      </span>
    </button>
  );
}
