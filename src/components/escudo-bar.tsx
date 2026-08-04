const ACENTOS: Record<string, string> = {
  verde: "from-emerald-400/90 to-emerald-600/90 text-emerald-950",
  ambar: "from-amber-300/90 to-amber-500/90 text-amber-950",
  azul: "from-sky-300/90 to-sky-500/90 text-sky-950",
  rojo: "from-rose-300/90 to-rose-500/90 text-rose-950",
  violeta: "from-violet-300/90 to-violet-500/90 text-violet-950",
};

/** Palabras que no aportan nada a unas iniciales: "La Grada de Deusto" → "GD". */
const VACIAS = new Set(["el", "la", "los", "las", "de", "del", "els", "es", "sa", "and"]);

const TAMANOS = {
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-lg",
};

/** Iniciales del bar sobre un degradado, en lugar de fotos que no tenemos. */
export function EscudoBar({
  name,
  accent = "verde",
  size = "md",
}: {
  name: string;
  accent?: string;
  size?: keyof typeof TAMANOS;
}) {
  const iniciales = name
    .split(/\s+/)
    .filter((palabra) => palabra.length > 1 && !VACIAS.has(palabra.toLowerCase()))
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase())
    .join("");

  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-xl bg-gradient-to-br font-bold ${
        ACENTOS[accent] ?? ACENTOS.verde
      } ${TAMANOS[size]}`}
    >
      {iniciales || name[0]?.toUpperCase()}
    </span>
  );
}
