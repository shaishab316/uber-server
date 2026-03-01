import { prisma } from '../../../utils/db';
import { debuglog as debug } from 'node:util';

export const debugLog = debug('app:cron:topup');

/**
 * Deletes topup records that were requested more than 24 hours ago and are still not completed.
 * This helps to keep the database clean from stale topup requests that were never completed.
 * Scheduled to run once a day at 2 AM via cron job.
 */
export const cleanupStaleTopups = async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const { count } = await prisma.topup.deleteMany({
    where: {
      is_completed: false,
      requested_at: { lt: cutoff },
    },
  });

  debugLog(
    'Stale topup cleanup — removed: %d (cutoff: %s)',
    count,
    cutoff.toISOString(),
  );

  return count;
};
