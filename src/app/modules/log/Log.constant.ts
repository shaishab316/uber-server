import { Log as TLog } from '../../../../prisma';

export const logSearchableFields: (keyof TLog)[] = ['message'];
