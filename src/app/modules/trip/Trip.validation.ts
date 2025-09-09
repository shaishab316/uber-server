import { z } from 'zod';

export const TripValidations = {
  create: z.object({
    body: z.object({}),
  }),
};
