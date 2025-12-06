import { z } from 'zod';

export const AdminValidations = {
  overview: z.object({
    query: z.object({
      tab: z.enum(['month', 'year']).default('year'),
    }),
  }),
};
