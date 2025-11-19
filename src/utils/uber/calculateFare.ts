import config from '../../config';

const fareConfig = config.uber.fare;

interface FareCalculationParams {
  distance: number; // meters
  passengerAges: number[];
  isAirportZone?: boolean;
  isPeakHour?: boolean;
  waitingTimeMinutes?: number;
  stopTimeMinutes?: number;
  currentTime?: Date;
}

interface FareBreakdown {
  basePrice: number;
  additionalKmPrice: number;
  passengerSurcharge: number;
  waitingFee: number;
  stopFee: number;
  totalPrice: number;
  driverShare: number;
  appFee: number;
  fidelityPoints: number;
}

// Peak hours: 12am-5am, 7:30am-8:30am, 4pm-7pm
const isPeakHourTime = (date: Date = new Date()): boolean => {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // 12am-5am (0:00-5:00)
  if (hours >= 0 && hours < 5) return true;

  // 7:30am-8:30am
  if (hours === 7 && minutes >= 30) return true;
  if (hours === 8 && minutes <= 30) return true;

  // 4pm-7pm (16:00-19:00)
  if (hours >= 16 && hours < 19) return true;

  return false;
};

export const calculateFare = ({
  distance,
  passengerAges,
  isAirportZone = false,
  isPeakHour,
  waitingTimeMinutes = 0,
  stopTimeMinutes = 0,
  currentTime,
}: FareCalculationParams): FareBreakdown => {
  const km = distance / 1000;

  // Determine if it's peak hour
  const peakHour = isPeakHour ?? isPeakHourTime(currentTime);

  // Count passengers
  const adultCount = passengerAges.filter(age => age >= 18).length;
  const childCount = passengerAges.length - adultCount;
  const totalPassengers = adultCount + childCount;

  // Get base pricing based on zone and peak hour
  let basePrice: number;
  let driverShare: number;
  let appFee: number;
  let additionalKmPrice: number;
  let additionalAppFeePerKm: number;
  const fidelityPoints = fareConfig.base.fidelity_points || 3;

  if (isAirportZone) {
    basePrice = fareConfig.airport.base_price;
    driverShare = fareConfig.airport.driver_share;
    appFee = fareConfig.airport.app_fee;
    additionalKmPrice = fareConfig.airport.additional_km_price;
    additionalAppFeePerKm = fareConfig.airport.additional_app_fee_per_km;
  } else if (peakHour) {
    basePrice = fareConfig.peak_hours.base_price;
    driverShare = fareConfig.peak_hours.driver_share;
    appFee = fareConfig.peak_hours.app_fee;
    additionalKmPrice = fareConfig.peak_hours.additional_km_price;
    additionalAppFeePerKm = fareConfig.additional_app_fee_per_km;
  } else {
    basePrice = fareConfig.base.price;
    driverShare = fareConfig.base.driver_share;
    appFee = fareConfig.base.app_fee;
    additionalKmPrice = fareConfig.additional_km_price;
    additionalAppFeePerKm = fareConfig.additional_app_fee_per_km;
  }

  // Calculate additional kilometers beyond base distance
  const baseDistanceKm = fareConfig.base.distance_km;
  const additionalKm = Math.max(0, km - baseDistanceKm);
  const additionalKmCharge = Math.ceil(additionalKm) * additionalKmPrice;
  const additionalAppFees = Math.ceil(additionalKm) * additionalAppFeePerKm;

  // Calculate passenger surcharges
  let passengerSurchargePercentage = 0;

  // Base includes 2 adults + 2 children (4 total)
  if (totalPassengers > 4) {
    // Count extra adults beyond the base
    const extraAdults = Math.max(0, adultCount - 2);

    if (extraAdults >= 2) {
      // 4th adult: +15%
      passengerSurchargePercentage +=
        fareConfig.passenger_charges.fourth_adult_percentage;
    }
    if (extraAdults >= 1) {
      // 3rd adult: +10%
      passengerSurchargePercentage +=
        fareConfig.passenger_charges.third_adult_percentage;
    }
  }

  // Calculate subtotal before passenger surcharge
  const subtotal = basePrice + additionalKmCharge;
  const passengerSurcharge = (subtotal * passengerSurchargePercentage) / 100;

  // Calculate waiting fees
  const waitingFee =
    waitingTimeMinutes > fareConfig.fees.waiting_after_minutes
      ? fareConfig.fees.waiting_fee
      : 0;

  // Calculate stop fees
  const stopFee =
    stopTimeMinutes > fareConfig.fees.stop_after_minutes
      ? fareConfig.fees.stop_fee
      : 0;

  // Calculate totals
  const totalPrice = subtotal + passengerSurcharge + waitingFee + stopFee;
  const finalDriverShare =
    driverShare +
    (additionalKmCharge - additionalAppFees) +
    (passengerSurcharge * driverShare) / basePrice;
  const finalAppFee =
    appFee + additionalAppFees + (passengerSurcharge * appFee) / basePrice;

  return {
    basePrice: subtotal,
    additionalKmPrice: additionalKmCharge,
    passengerSurcharge,
    waitingFee,
    stopFee,
    totalPrice: +totalPrice.toFixed(2),
    driverShare: +finalDriverShare.toFixed(2),
    appFee: +finalAppFee.toFixed(2),
    fidelityPoints,
  };
};

// Helper function for calculating cancellation fees
export const calculateCancellationFee = (originalTripFare: number): number => {
  return +(
    (originalTripFare * fareConfig.fees.cancellation_driver_percentage) /
    100
  ).toFixed(2);
};

// Helper function for calculating no-show fees
export const calculateNoShowFee = (originalTripFare: number): number => {
  return +(
    (originalTripFare * fareConfig.fees.no_show_passenger_percentage) /
    100
  ).toFixed(2);
};
