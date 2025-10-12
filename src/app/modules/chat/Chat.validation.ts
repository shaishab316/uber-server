import { z } from 'zod';
import { exists } from '../../../utils/db/exists';
import { EMessageMediaType } from '../../../../prisma';

export const ChatValidations = {
  getChat: z.object({
    query: z.object({
      user_id: z
        .string()
        .refine(exists('user'), {
          error: ({ input }) => `User not found with id: ${input}`,
          path: ['user_id'],
        })
        .optional(),
      driver_id: z
        .string()
        .refine(exists('user'), {
          error: ({ input }) => `Driver not found with id: ${input}`,
          path: ['driver_id'],
        })
        .optional(),
    }),
  }),

  uploadMedia: z.object({
    params: z.object({
      media_type: z.enum(EMessageMediaType),
    }),
    body: z.object({
      images: z.array(z.string()).optional(),
      videos: z.array(z.string()).optional(),
    }),
  }),

  //! socket validation
  joinChat: z.object({
    chat_id: z.string().refine(exists('chat'), {
      error: ({ input }) => `Chat not found with id: ${input}`,
      path: ['chat_id'],
    }),
  }),
};
