import { z } from 'zod';
import { EVehicle } from '../../../../prisma';
import { enum_encode } from '../../../utils/transform/enum';
import { exists } from '../../../utils/db/exists';
import config from '../../../config';

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
  requestForTrip: z.object({
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

  acceptTrip: z.object({
    body: z.object({
      location: locationSchema,
    }),
  }),

  startTrip: z.object({
    body: z.object({
      sOtp: z.coerce
        .string({
          error: 'Start Otp is missing',
        })
        .length(
          config.otp.length,
          `Start Otp must be ${config.otp.length} digits`,
        ),
    }),
  }),

  rejectTrip: z.object({
    body: z.object({
      reason: z
        .string({ error: 'Reason is missing' })
        .nonempty('Reason is required'),
    }),
  }),

  completeTrip: z.object({
    body: z.object({
      eOtp: z.coerce
        .string({
          error: 'End Otp is missing',
        })
        .length(
          config.otp.length,
          `End Otp must be ${config.otp.length} digits`,
        ),
    }),
  }),

  //! socket validations..........
  joinTrip: z.object({
    trip_id: z.string().refine(exists('trip'), {
      error: ({ input }) => `Trip not found with id: ${input}`,
    }),
  }),

  updateTripLocation: z.object({
    location: locationSchema,
    trip_id: z.string().refine(exists('trip'), {
      error: ({ input }) => `Trip not found with id: ${input}`,
      path: ['trip_id'],
    }),
  }),
};
