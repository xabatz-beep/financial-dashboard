/**
 * Campos comunes al alta y a la edición de una emisión.
 * `idPrefijo` mantiene únicos los identificadores: en el panel hay muchos formularios a la vez.
 */
export function CamposEmision({
  idPrefijo,
  maxScreens,
  valores,
}: {
  idPrefijo: string;
  maxScreens: number;
  valores?: {
    screens: number;
    soundOn: boolean;
    reservationRequired: boolean;
    promo: string | null;
    note: string | null;
  };
}) {
  const id = (campo: string) => `${idPrefijo}-${campo}`;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="etiqueta" htmlFor={id("screens")}>
          Pantallas que le dedicas
        </label>
        <input
          id={id("screens")}
          type="number"
          name="screens"
          min={1}
          max={Math.max(1, maxScreens)}
          defaultValue={valores?.screens ?? 1}
          className="campo"
        />
      </div>

      <div className="flex items-end gap-4 pb-1">
        <label className="flex items-center gap-2 text-sm" htmlFor={id("soundOn")}>
          <input
            id={id("soundOn")}
            type="checkbox"
            name="soundOn"
            defaultChecked={valores?.soundOn ?? false}
            className="size-4 accent-[#22c55e]"
          />
          Con sonido
        </label>
        <label className="flex items-center gap-2 text-sm" htmlFor={id("reservation")}>
          <input
            id={id("reservation")}
            type="checkbox"
            name="reservationRequired"
            defaultChecked={valores?.reservationRequired ?? false}
            className="size-4 accent-[#22c55e]"
          />
          Hay que reservar
        </label>
      </div>

      <div className="sm:col-span-2">
        <label className="etiqueta" htmlFor={id("promo")}>
          Promoción (opcional)
        </label>
        <input
          id={id("promo")}
          type="text"
          name="promo"
          maxLength={120}
          defaultValue={valores?.promo ?? ""}
          placeholder="2 cañas + tapa por 6 €"
          className="campo"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="etiqueta" htmlFor={id("note")}>
          Nota para los clientes (opcional)
        </label>
        <input
          id={id("note")}
          type="text"
          name="note"
          maxLength={160}
          defaultValue={valores?.note ?? ""}
          placeholder="Proyector en la terraza si no llueve."
          className="campo"
        />
      </div>
    </div>
  );
}
