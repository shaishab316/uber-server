import { z } from 'zod';
import { EVehicle } from '../../../../prisma';
import { enum_encode } from '../../../util/transform/enum';

export const locationSchema = z.object({
  geo: z.tuple([
    z.coerce
      .number()
      .refine(
        long => long >= -180 && long <= 180,
        'Longitude must be between -180 and 180',
      ),
    z.coerce
      .number()
      .refine(
        lat => lat >= -90 && lat <= 90,
        'Latitude must be between -90 and 90',
      ),
  ]),
  address: z.coerce.string(),
});

export const TripValidations = {
  start: z.object({
    body: z.object({
      vehicle: z.string().transform(enum_encode).pipe(z.enum(EVehicle)),
      pickup_address: locationSchema,
      dropoff_address: locationSchema,
      stops: z.array(locationSchema).optional(),
      passenger_ages: z.array(z.coerce.number()),
    }),
  }),
};
