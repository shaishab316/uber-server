import axios from 'axios';
import config from '../../config';

export type Coordinate = [long: string, lat: string];
export type VehicleType = 'driving' | 'walking' | 'bicycling' | 'transit';

export default async function getNearestDriver(
  rider: Coordinate,
  drivers: Coordinate[],
  vehicleType: VehicleType = 'driving',
) {
  const originStr = `${rider[1]},${rider[0]}`;
  const destinationsStr = drivers
    .map(([lng, lat]) => `${lat},${lng}`)
    .join('|');

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
    originStr,
  )}&destinations=${encodeURIComponent(
    destinationsStr,
  )}&mode=${vehicleType}&key=${config.google_map_key}`;

  const { data } = await axios.get(url);

  if (data.status !== 'OK') throw new Error('API error: ' + data.status);

  const elements = data.rows[0].elements;

  // Map each driver with distance & duration
  const results = drivers
    .map((driver, i) => {
      const el = elements[i];
      if (el.status !== 'OK') return null;
      return {
        driver: driver,
        distanceText: el.distance.text,
        distanceValue: el.distance.value,
        durationText: el.duration.text,
        durationValue: el.duration.value,
      };
    })
    .filter(Boolean);

  // Find nearest driver (lowest durationValue)
  const nearest = results.reduce((prev, curr) =>
    curr!.durationValue < prev!.durationValue ? curr : prev,
  );

  return { nearest, results };
}
