import { z } from 'zod';
import { date } from '../../../util/transform/date';

export const LogValidations = {
  log: z.object({
    query: z.object({
      timestamp: z
        .union([z.date(), z.string().transform(date).pipe(z.date())])
        .optional(),
    }),
  }),
};
