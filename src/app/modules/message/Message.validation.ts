import { z } from 'zod';

export const MessageValidations = {
  create: z.object({
    body: z.object({}),
  }),
};
