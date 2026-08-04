/** Filtro temporal de la lista de partidos. Vive aparte para poder usarlo en el cliente. */
export type When = "todos" | "hoy" | "manana" | "finde";

export const WHEN_OPTIONS: { id: When; label: string }[] = [
  { id: "todos", label: "Próximos" },
  { id: "hoy", label: "Hoy" },
  { id: "manana", label: "Mañana" },
  { id: "finde", label: "Este finde" },
];
