import { z } from 'zod';
import { exists } from '../../../util/db/exists';

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

  //! socket validation
  joinChat: z.object({
    chat_id: z.string().refine(exists('chat'), {
      error: ({ input }) => `Chat not found with id: ${input}`,
      path: ['chat_id'],
    }),
  }),
};
