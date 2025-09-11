import colors from 'colors';
import { logger } from '../logger/logger';
import { getDB } from '../server/connectDB';

export async function setupIndexes() {
  try {
    await getDB()!
      .collection('available_drivers')
      .createIndex(
        { 'location.geo': '2dsphere' },
        { background: true, name: 'location_2dsphere' },
      );
  } finally {
    logger.info(colors.green('✅ Indexes setup successfully'));
  }
}
