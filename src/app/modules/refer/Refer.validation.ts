import { z } from 'zod';

export const ReferValidations = {
  refer: z.object({
    query: z.object({
      refer_id: z.coerce.number().optional(),
    }),
  }),
};
