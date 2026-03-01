import cron from 'node-cron';
import { cleanupStaleTopups } from './app/modules/topup/Topup.cron';
import { debuglog as debug } from 'node:util';

const debugLog = debug('app:cron:index');

const jobs = [
  {
    name: 'cleanup:stale-topups',
    schedule: '0 2 * * *', // every day at 2 AM
    fn: cleanupStaleTopups,
  },
] satisfies TCronJob[];

/**
 * Registers all cron jobs and wires up graceful shutdown.
 * Call once during server startup.
 */
export const registerCronJobs = () => {
  const tasks = jobs.map(({ name, schedule, fn }) => {
    const task = cron.schedule(schedule, async () => {
      debugLog('[%s] started', name);
      const start = Date.now();
      try {
        await fn();
        debugLog('[%s] done in %dms', name, Date.now() - start);
      } catch (err) {
        debugLog('[%s] failed: %o', name, err);
      }
    });

    debugLog('[%s] registered → %s', name, schedule);
    return task;
  });

  // Graceful shutdown — stop all tasks before exit
  const stop = (signal: string) => {
    debugLog('Received %s, stopping cron jobs...', signal);
    tasks.forEach(t => t.stop());
    debugLog('All cron jobs stopped.');
  };

  process.once('SIGINT', () => stop('SIGINT'));
  process.once('SIGTERM', () => stop('SIGTERM'));
};

type TCronJob = {
  name: string;
  schedule: string;
  fn: () => Promise<unknown>;
};
