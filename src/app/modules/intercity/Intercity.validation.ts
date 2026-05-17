import { z } from 'zod';
import {
  IntercityStatus,
  JoinRequestStatus,
  EDay,
  EVehicle,
} from '../../../../prisma';
import { enum_encode } from '../../../utils/transform/enum';

const locationSchema = z.object({
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

export const IntercityValidations = {
  createIntercity: z.object({
    body: z.object({
      vehicle: z.string().transform(enum_encode).pipe(z.enum(EVehicle)),
      pickup_address: locationSchema,
      dropoff_address: locationSchema,
      available_seats: z.coerce.number().min(1).max(7),
      total_seats: z.coerce.number().min(1).max(7),
      price_per_seat: z.coerce.number().min(0),
      scheduled_at: z.iso.datetime().optional(),
      notes: z.string().optional(),
      stops: z.array(locationSchema).optional(),
    }),
  }),

  updateIntercityStatus: z.object({
    body: z.object({
      status: z.string().transform(enum_encode).pipe(z.enum(IntercityStatus)),
    }),
  }),

  handleJoinRequest: z.object({
    body: z.object({
      status: z.string().transform(enum_encode).pipe(z.enum(JoinRequestStatus)),
    }),
  }),
};
