import colors from 'colors';
import { logger } from '../logger/logger';
import { getDB } from '../server/connectDB';
import { Db } from 'mongodb';

let db: Db | null = null;

export async function setupIndexes() {
  db ??= getDB();

  logger.info(colors.green('🔑 DB Indexes setup started...'));
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
    logger.info(colors.green('✅ DB Indexes setup successfully'));
  }
}
