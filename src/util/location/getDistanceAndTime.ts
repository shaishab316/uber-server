import axios from 'axios';
import config from '../../config';
import { VehicleType } from './getNearestDriver';

export default async function getDistanceAndTime(
  origin: [long: string, lat: string],
  destination: [long: string, lat: string],
  vehicleType: VehicleType = 'driving',
) {
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
      `${origin[1]},${origin[0]}`,
    )}&destinations=${encodeURIComponent(`${destination[1]},${destination[0]}`)}&key=${config.google_map_key}&mode=${vehicleType}`,
  );

  return {
    distance: data?.rows[0]?.elements[0]?.distance?.text,
    duration: data?.rows[0]?.elements[0]?.duration?.text,
  };
}
