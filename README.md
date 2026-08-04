# ¿Dónde lo echan?

App para encontrar **en qué bar ponen tu partido**. Los bares publican qué partidos de fútbol y
baloncesto van a emitir (con pantallas, sonido, promoción y si hace falta reservar) y cualquiera
puede buscar por partido, ciudad o cercanía y decir si va.

## Qué se puede hacer

**Si buscas dónde ver un partido**

- Agenda de partidos agrupada por día, con filtros de deporte, ciudad, buscador de equipo y atajos
  de "Hoy", "Mañana" y "Este finde".
- Ficha de cada partido con todos los bares que lo emiten: pantallas dedicadas, si lleva sonido,
  promoción, si hay que reservar, terraza y cocina.
- Ordenar los bares por ambiente (gente que ha dicho "voy") o **por cercanía** usando la
  geolocalización del navegador, con la distancia real a cada bar.
- Botón "Voy" sin registro: se recuerda con una cookie anónima y sirve para que el bar sepa cuánta
  gente espera.
- Directorio de bares con su ficha y su agenda completa.

**Si tienes un bar**

- Alta gratuita del bar (con la ubicación tomada del navegador o del centro de la ciudad).
- Panel donde eliges de la lista de partidos y publicas los detalles de tu emisión en dos clics.
- Edición y borrado de cada emisión, edición de la ficha del bar y contador de personas que van.

## Cómo arrancarlo

```bash
npm install
npm run dev     # http://localhost:3000
```

Para producción: `npm run build && npm start`.

La base de datos SQLite se crea sola en `data/dondeloechan.db` la primera vez, con 14 bares de
ejemplo en cinco ciudades y un calendario de partidos **relativo al día de hoy**: cuando ya no
quedan partidos futuros, el calendario de demostración se regenera solo.

Cuenta de prueba del panel:

| Correo              | Contraseña    |
| ------------------- | ------------- |
| `demo@elpenalti.es` | `partido2026` |

## Cómo está hecho

- **Next.js 16** (App Router, React 19) con Server Components y Server Actions, sin capa de API
  intermedia para las mutaciones.
- **SQLite** con el módulo nativo `node:sqlite`: cero dependencias de base de datos y ningún paso
  de compilación nativa.
- **Tailwind CSS 4** para la interfaz (tema oscuro propio en `src/app/globals.css`).
- Contraseñas con `scrypt` y sesiones en cookie `httpOnly` (`src/lib/auth.ts`).
- Fechas siempre en UTC en la base de datos y formateadas en `Europe/Madrid` (`src/lib/format.ts`).

```
src/
  app/
    page.tsx                  agenda de partidos con filtros
    partidos/[id]/            bares que emiten un partido
    bares/, bares/[slug]/     directorio y ficha de bar
    panel/                    alta, login, agenda del bar y perfil
    api/partidos, api/asistencia
  components/                 tarjetas, filtros y formularios
  lib/                        db, esquema, datos de ejemplo, consultas, auth, fechas y distancias
```

### API pública

```
GET /api/partidos?ciudad=Bilbao&deporte=futbol&cuando=hoy&bares=1
```

Devuelve los partidos con su canal y, con `bares=1`, los bares que los emiten. `cuando` acepta
`todos`, `hoy`, `manana` y `finde`.

## Estado

Los datos de partidos y bares son de demostración: todavía no hay integración con un proveedor real
de calendarios deportivos ni con las cadenas de televisión. El siguiente paso natural es sustituir
`src/lib/seed.ts` por una importación desde una API de resultados y añadir moderación de las altas
de bares.

---

Sígueme en mis redes sociales: [beacons.ai/xabatz](https://beacons.ai/xabatz)
