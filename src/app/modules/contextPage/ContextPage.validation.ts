import { z } from 'zod';

export const ContextPageValidations = {
  modify: z.object({
    body: z.object({
      pageName: z
        .string({
          error: 'Page name is missing',
        })
        .min(1, "Page name can't be empty"),
      content: z
        .string({
          error: 'Content is missing',
        })
        .min(1, "Content can't be empty"),
    }),
  }),
};
