import cron from 'node-cron';
import { cleanupStaleTopups } from './app/modules/topup/Topup.cron';
import { debuglog as debug } from 'node:util';
import { Server } from 'node:http';

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
export const registerCronJobs = (server: Server) => {
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

  //? Stop all cron jobs when server is closing
  server.once('close', () => {
    tasks.forEach(t => t.stop());
    debugLog('All cron jobs stopped.');
  });
};

type TCronJob = {
  name: string;
  schedule: string;
  fn: () => Promise<unknown>;
};
