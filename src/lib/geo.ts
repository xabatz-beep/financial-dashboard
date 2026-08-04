export interface Point {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

/** Distancia en kilómetros entre dos coordenadas (fórmula del haversine). */
export function distanceKm(a: Point, b: Point): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Enlace para abrir la dirección del bar en Google Maps. */
export function mapsUrl(name: string, address: string, city: string): string {
  const query = encodeURIComponent(`${name}, ${address}, ${city}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
