import z from 'zod';
import { TripValidations } from './Trip.validation';

export type TTripStart = z.infer<typeof TripValidations.start>['body'];
