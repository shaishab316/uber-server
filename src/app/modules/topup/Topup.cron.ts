import { prisma } from '../../../utils/db';
import { debuglog as debug } from 'node:util';

export const debugLog = debug('app:cron:topup');

/**
 * Deletes all uncompleted topup sessions older than 1 hour.
 * AZUL's hosted payment page expires in ~30 minutes, so any
 * uncompleted topup older than 1 hour is guaranteed to be dead.
 *
 * Recommended schedule: every day at 2 AM → "0 2 * * *"
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
