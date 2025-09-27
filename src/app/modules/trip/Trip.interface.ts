import z from 'zod';
import { TripValidations } from './Trip.validation';

export type TTripStart = z.infer<typeof TripValidations.startTrip>['body'];
export type TTripJoin = z.infer<typeof TripValidations.joinTrip>;
