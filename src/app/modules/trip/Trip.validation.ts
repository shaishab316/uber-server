import { z } from 'zod';
import { EVehicle } from '../../../../prisma';
import { enum_encode } from '../../../util/transform/enum';
import { exists } from '../../../util/db/exists';

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
  type: z.literal('Point').default('Point'),
});

export const TripValidations = {
  startTrip: z.object({
    body: z.object({
      vehicle: z.string().transform(enum_encode).pipe(z.enum(EVehicle)),
      pickup_address: locationSchema,
      dropoff_address: locationSchema,
      stops: z.array(locationSchema).optional(),
      passenger_ages: z.array(z.coerce.number()),
    }),
  }),

  updateLocation: z.object({
    body: z.object({
      location: locationSchema,
    }),
  }),

  reject: z.object({
    body: z.object({
      reason: z
        .string({ error: 'Reason is missing' })
        .nonempty('Reason is required'),
    }),
  }),

  joinTrip: z.object({
    trip_id: z.string().refine(exists('trip'), {
      error: ({ input }) => `Trip not found with id: ${input}`,
    }),
  }),
};
