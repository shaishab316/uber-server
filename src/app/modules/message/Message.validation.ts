import { z } from 'zod';
import { exists } from '../../../util/db/exists';
import { EMessageMediaType } from '../../../../prisma';

export const MessageValidations = {
  create: z.object({
    chat_id: z.string().refine(exists('chat'), {
      error: ({ input }) => `Chat not found with id: ${input}`,
      path: ['chat_id'],
    }),
    content: z.string().trim().optional(),
    media_url: z.string().trim().optional(),
    media_type: z.enum(EMessageMediaType).optional(),
    user_id: z.string().optional(),
    driver_id: z.string().optional(),
  }),
};
