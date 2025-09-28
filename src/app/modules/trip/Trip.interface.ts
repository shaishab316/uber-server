import z from 'zod';
import { TripValidations } from './Trip.validation';

export type TRequestForTrip = z.infer<
  typeof TripValidations.requestForTrip
>['body'] & { passenger_id: string };
export type TTripJoin = z.infer<typeof TripValidations.joinTrip>;
export type TStartTrip = z.infer<typeof TripValidations.startTrip>;
export type TUpdateTripLocation = z.infer<
  typeof TripValidations.updateTripLocation
>;
