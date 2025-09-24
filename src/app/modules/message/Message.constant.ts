import { Message as TMessage } from '../../../../prisma';

export const messageSearchableFields: (keyof TMessage)[] = [
  'content',
  'media_url',
];
