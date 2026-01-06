export type LatLng = { lat: number; lng: number };

// TrackPoint extends LatLng with optional timestamp/accuracy for filtering.
// It stays structurally compatible with LatLng for distance computations.
export type TrackPoint = LatLng & { t?: number; acc?: number };

const toRad = (v: number) => (v * Math.PI) / 180;

// Haversine distance in meters
export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000; // Earth radius (m)
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

export function pathDistanceMeters(points: LatLng[]): number {
  if (!points || points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineMeters(points[i - 1], points[i]);
  }
  return total;
}

export function formatDistance(meters: number): string {
  if (!meters || meters <= 0) return "0 m";
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  const rounded = km < 10 ? km.toFixed(2) : km.toFixed(1);
  return `${rounded} km`;
}
