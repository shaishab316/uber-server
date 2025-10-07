import config from '../../config';

const {
  adult_fare,
  distance_fare, // per km
  non_adult_fare,
  time_fare, // per minute
} = config.uber.fare;

export const calculateFare = ({
  distance, // meters
  time, // seconds
  passengerAges,
}: {
  distance: number;
  time: number;
  passengerAges: number[];
}) => {
  const km = distance / 1000;
  const minutes = time / 60;

  // count passenger types
  const adultCount = passengerAges.filter(a => a >= 18).length;
  const nonAdultCount = passengerAges.length - adultCount;

  const cost = km * distance_fare + minutes * time_fare;

  // fare per type
  const adultFare = adultCount * adult_fare * cost;

  const nonAdultFare = nonAdultCount * non_adult_fare * cost;

  // total fare (ensure minimum fare applies)
  const total = adultFare + nonAdultFare;

  return +Math.max(total, cost).toFixed(2);
};
