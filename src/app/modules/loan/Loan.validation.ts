import { z } from 'zod';

export const LoanValidations = {
  create: z.object({
    body: z.object({}),
  }),
};
