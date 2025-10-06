import { z } from 'zod';
import { exists } from '../../../utils/db/exists';

export const CancelTripValidations = {
  getAllCancelTrip: z.object({
    query: z.object({
      driver_id: z
        .string()
        .refine(exists('user'), {
          error: ({ input }) => `Driver not found with id: ${input}`,
          path: ['driver_id'],
        })
        .optional(),
    }),
  }),
};
