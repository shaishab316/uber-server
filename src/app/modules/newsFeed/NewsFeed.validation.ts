import { z } from 'zod';
import { ENewsFeedCategory, EUserRole } from '../../../../prisma';

export const NewsFeedValidations = {
  create: z.object({
    body: z.object({
      title: z.string({ error: 'Title is required' }),
      content: z.string({ error: 'Content is required' }),
      body: z.string().optional(),
      image: z.string(),
      role: z.enum(EUserRole).default(EUserRole.USER),
      category: z.enum(ENewsFeedCategory),
    }),
  }),

  edit: z.object({
    body: z.object({
      news_id: z.string({ error: 'News ID is required' }),
      title: z.string().optional(),
      content: z.string().optional(),
      body: z.string().optional(),
      image: z.string().optional(),
      role: z.enum(EUserRole).default(EUserRole.USER),
      category: z.enum(ENewsFeedCategory).optional(),
    }),
  }),

  delete: z.object({
    body: z.object({
      news_id: z.string({ error: 'News ID is required' }),
    }),
  }),

  getAllNews: z.object({
    query: z.object({
      category: z.enum(ENewsFeedCategory).optional(),
    }),
  }),
};
