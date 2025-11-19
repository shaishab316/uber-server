import config from '../../config';
import {
  calculateFare,
  calculateCancellationFee,
  calculateNoShowFee,
} from './calculateFare';

// Types
interface TLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface Trip {
  distance_km: number | null;
  passenger_ages: number[];
  requested_at: Date;
  accepted_at: Date | null;
  started_at: Date | null;
  pickup_address: TLocation;
  dropoff_address: TLocation;
  stops: TLocation[];
}

interface FareBreakdown {
  total: number;
  driver: number;
  app: number;
  fidelity: number;
  details: {
    base: number;
    distance: number;
    passengers: number;
    waiting: number;
    stops: number;
  };
}

// Utils
const getMinutesBetween = (start: Date | null, end: Date | null): number => {
  if (!start || !end) return 0;
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
};

const getDistance = (point1: TLocation, point2: TLocation): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Airport detection
const isNearAirport = async (location: TLocation): Promise<boolean> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=5000&type=airport&key=${config.google_map_key}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results?.length > 0;
  } catch {
    return false;
  }
};

// Simple airport zones (add your local airports)
const AIRPORT_ZONES = [
  { lat: 25.7617, lng: -80.1918, radius: 5 }, // Example: Miami Airport
];

const isAirportZone = (location: TLocation): boolean => {
  return AIRPORT_ZONES.some(
    airport => getDistance(location, airport) <= airport.radius,
  );
};

// Main functions
export const calculateTripFare = async (trip: Trip): Promise<FareBreakdown> => {
  if (!trip.distance_km) throw new Error('Distance required');

  const waitingMinutes = getMinutesBetween(trip.accepted_at, trip.started_at);
  const stopMinutes = trip.stops.length * 2; // 2 min per stop

  // Check if pickup or dropoff is near airport
  const isAirport =
    isAirportZone(trip.pickup_address) || isAirportZone(trip.dropoff_address);

  const fareData = calculateFare({
    distance: trip.distance_km * 1000,
    passengerAges: trip.passenger_ages,
    isAirportZone: isAirport,
    currentTime: trip.requested_at,
    waitingTimeMinutes: waitingMinutes,
    stopTimeMinutes: stopMinutes,
  });

  return {
    total: fareData.totalPrice,
    driver: fareData.driverShare,
    app: fareData.appFee,
    fidelity: fareData.fidelityPoints,
    details: {
      base: fareData.basePrice,
      distance: fareData.additionalKmPrice,
      passengers: fareData.passengerSurcharge,
      waiting: fareData.waitingFee,
      stops: fareData.stopFee,
    },
  };
};

export const getCancellationFee = async (trip: Trip): Promise<number> => {
  const fare = await calculateTripFare(trip);
  return calculateCancellationFee(fare.total);
};

export const getNoShowFee = async (trip: Trip): Promise<number> => {
  const fare = await calculateTripFare(trip);
  return calculateNoShowFee(fare.total);
};

// For Google API airport detection (optional)
export const calculateTripFareWithAPI = async (
  trip: Trip,
): Promise<FareBreakdown> => {
  if (!trip.distance_km) throw new Error('Distance required');

  const waitingMinutes = getMinutesBetween(trip.accepted_at, trip.started_at);
  const stopMinutes = trip.stops.length * 2;

  const isAirport =
    (await isNearAirport(trip.pickup_address)) ||
    (await isNearAirport(trip.dropoff_address));

  const fareData = calculateFare({
    distance: trip.distance_km * 1000,
    passengerAges: trip.passenger_ages,
    isAirportZone: isAirport,
    currentTime: trip.requested_at,
    waitingTimeMinutes: waitingMinutes,
    stopTimeMinutes: stopMinutes,
  });

  return {
    total: fareData.totalPrice,
    driver: fareData.driverShare,
    app: fareData.appFee,
    fidelity: fareData.fidelityPoints,
    details: {
      base: fareData.basePrice,
      distance: fareData.additionalKmPrice,
      passengers: fareData.passengerSurcharge,
      waiting: fareData.waitingFee,
      stops: fareData.stopFee,
    },
  };
};
