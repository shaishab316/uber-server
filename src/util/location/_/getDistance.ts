const EARTH_RADIUS_METERS = 6371000;
const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export type _TLocation = [longitude: number, latitude: number];

export function _getDistance(
  startCoords: _TLocation,
  endCoords: _TLocation,
): number {
  const [startLng, startLat] = startCoords;
  const [endLng, endLat] = endCoords;

  const lat1 = toRadians(startLat);
  const lat2 = toRadians(endLat);
  const deltaLat = toRadians(endLat - startLat);
  const deltaLng = toRadians(endLng - startLng);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  const angularDistance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * angularDistance;
}
