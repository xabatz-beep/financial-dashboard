/** Centro aproximado de cada ciudad, para situar un bar nuevo sin necesidad de geocodificador. */
export const CIUDADES: Record<string, { lat: number; lng: number }> = {
  "A Coruña": { lat: 43.3623, lng: -8.4115 },
  Alicante: { lat: 38.3452, lng: -0.481 },
  Barcelona: { lat: 41.3874, lng: 2.1686 },
  Bilbao: { lat: 43.263, lng: -2.935 },
  Córdoba: { lat: 37.8882, lng: -4.7794 },
  Gijón: { lat: 43.5322, lng: -5.6611 },
  Granada: { lat: 37.1773, lng: -3.5986 },
  Madrid: { lat: 40.4168, lng: -3.7038 },
  Málaga: { lat: 36.7213, lng: -4.4214 },
  Murcia: { lat: 37.9922, lng: -1.1307 },
  Palma: { lat: 39.5696, lng: 2.6502 },
  Pamplona: { lat: 42.8125, lng: -1.6458 },
  "San Sebastián": { lat: 43.3183, lng: -1.9812 },
  Santander: { lat: 43.4623, lng: -3.805 },
  Sevilla: { lat: 37.3891, lng: -5.9845 },
  Valencia: { lat: 39.4699, lng: -0.3763 },
  Valladolid: { lat: 41.6523, lng: -4.7245 },
  Vigo: { lat: 42.2406, lng: -8.7207 },
  Zaragoza: { lat: 41.6488, lng: -0.8891 },
};

export const NOMBRES_CIUDADES = Object.keys(CIUDADES);
