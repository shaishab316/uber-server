import { UserActivity as TUserActivity } from '../../../../prisma';

/**
 * Fields of UserActivity that are searchable
 */
export const userActivitySearchableFields = ['content', 'path'] satisfies Array<
  keyof TUserActivity
>;
