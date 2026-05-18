import cron from 'node-cron';
import { cleanupStaleTopups } from './app/modules/topup/Topup.cron';
import { sendIntercityReminders } from './app/modules/intercity/Intercity.cron';
import { Server } from 'node:http';
import { errorLogger } from './utils/logger';

const jobs = [
  {
    name: 'cleanup:stale-topups',
    schedule: '0 2 * * *', // every day at 2 AM
    fn: cleanupStaleTopups,
  },
  {
    name: 'intercity:send-reminders',
    schedule: '*/5 * * * *', // every 5 minutes
    fn: sendIntercityReminders,
  },
] satisfies TCronJob[];

/**
 * Registers all cron jobs and wires up graceful shutdown.
 * Call once during server startup.
 */
export const registerCronJobs = (server: Server) => {
  const tasks = jobs.map(({ name, schedule, fn }) => {
    const task = cron.schedule(schedule, async () => {
      console.log('[%s] started', name);
      const start = Date.now();
      try {
        await fn();
        console.log('[%s] done in %dms', name, Date.now() - start);
      } catch (err) {
        errorLogger.error('[%s] failed: %o', name, err);
      }
    });

    console.log('[%s] registered → %s', name, schedule);
    return task;
  });

  //? Stop all cron jobs when server is closing
  server.once('close', () => {
    tasks.forEach(t => t.stop());
    console.log('All cron jobs stopped.');
  });
};

type TCronJob = {
  name: string;
  schedule: string;
  fn: () => Promise<unknown>;
};
