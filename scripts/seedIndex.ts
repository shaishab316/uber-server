import chalk from 'chalk';
import { logger } from '../src/utils/logger';
import { MongoClient } from 'mongodb';
import config from '../src/config';

export async function setupIndexes() {
  const client = new MongoClient(config.url.database);

  logger.info(chalk.green('🚀 Database connecting...'));
  await client.connect();
  logger.info(chalk.green('🚀 Database connected successfully'));

  const db = client.db(config.server.db_name);

  logger.info(chalk.green('🔑 DB Indexes setup started...'));
  try {
    {
      await db
        ?.collection('available_drivers')
        .createIndex(
          { 'location.geo': '2dsphere' },
          { background: true, name: 'location__2dsphere' },
        );
    }

    {
      await db
        ?.collection('trips')
        .createIndex(
          { 'pickup_address.geo': '2dsphere' },
          { background: true, name: 'pickup_address__2dsphere' },
        );

      await db
        ?.collection('trips')
        .createIndex(
          { 'dropoff_address.geo': '2dsphere' },
          { background: true, name: 'dropoff_address__2dsphere' },
        );

      await db
        ?.collection('trips')
        .createIndex(
          { 'stops.geo': '2dsphere' },
          { background: true, name: 'stops__2dsphere' },
        );
    }

    {
      await db
        ?.collection('users')
        .createIndex(
          { 'location.geo': '2dsphere' },
          { background: true, name: 'location__2dsphere' },
        );
    }
  } finally {
    logger.info(chalk.green('✅ DB Indexes setup successfully'));
  }
}
