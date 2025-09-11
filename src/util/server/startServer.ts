/* eslint-disable no-console */
import colors from 'colors';
import { createServer } from 'http';
import app from '../../app';
import config from '../../config';
import { errorLogger, logger } from '../logger/logger';
import shutdownServer from './shutdownServer';
import connectDB from './connectDB';
import { AdminServices } from '../../app/modules/admin/Admin.service';
import killPort from 'kill-port';
import { verifyEmailTransporter } from '../sendMail';
import { setupIndexes } from '../db/setupIndexes';

const {
  server: { port, ip_address, name },
} = config;

/**
 * Starts the server
 *
 * This function creates a new HTTP server instance and connects to the database.
 * It also seeds the admin user if it doesn't exist in the database.
 */
export default async function startServer() {
  try {
    try {
      await killPort(port);
    } catch (error) {
      console.log(error);
    }

    await connectDB();
    await setupIndexes();
    await AdminServices.seed();
    await verifyEmailTransporter();

    const server = createServer(app);

    console.clear();
    console.log(colors.gray('[console cleared]'));

    await new Promise<void>(resolve => {
      server.listen(port, ip_address, resolve);
    });

    logger.info(
      colors.yellow(`🚀 ${name} is running on http://${ip_address}:${port}`),
    );

    ['SIGTERM', 'SIGINT', 'unhandledRejection', 'uncaughtException'].forEach(
      signal =>
        process.on(signal, async (err?: Error) => {
          await shutdownServer(server, signal, err);
        }),
    );

    return server;
  } catch (error) {
    errorLogger.error(colors.red('❌ Server startup failed!'), error);
    process.exit(1);
  }
}
