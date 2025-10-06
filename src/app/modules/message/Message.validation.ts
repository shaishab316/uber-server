import { z } from 'zod';
import { exists } from '../../../utils/db/exists';
import { EMessageMediaType } from '../../../../prisma';

export const MessageValidations = {
  createMsg: z
    .object({
      chat_id: z.string().refine(exists('chat'), {
        error: ({ input }) => `Chat not found with id: ${input}`,
        path: ['chat_id'],
      }),
      content: z.string().trim().optional(),
      media_url: z.string().optional(),
      media_type: z.enum(EMessageMediaType).optional(),
    })
    .superRefine((data, ctx) => {
      // must have content or media_url
      if (!data.content && !data.media_url) {
        ctx.addIssue({
          code: 'custom',
          path: ['content'],
          message: 'Content or media url is required',
        });
      }

      // if one exists, the other must too
      if (data.media_url && !data.media_type) {
        ctx.addIssue({
          code: 'custom',
          path: ['media_type'],
          message: 'Media type is required if media url is provided',
        });
      }
      if (data.media_type && !data.media_url) {
        ctx.addIssue({
          code: 'custom',
          path: ['media_url'],
          message: 'Media url is required if media type is provided',
        });
      }

      // enforce path by type
      if (data.media_url && data.media_type) {
        const rules: Record<string, string> = {
          image: '/images/',
          video: '/videos/',
        };

        const prefix = rules[data.media_type];
        if (prefix && !data.media_url.startsWith(prefix)) {
          ctx.addIssue({
            code: 'custom',
            path: ['media_url'],
            message: `Media url must start with '${prefix}' for '${data.media_type}' media_type`,
          });
        }
      }
    }),

  deleteMsg: z.object({
    message_id: z.string().refine(exists('message'), {
      error: ({ input }) => `Message not found with id: ${input}`,
      path: ['message_id'],
    }),
  }),
};
