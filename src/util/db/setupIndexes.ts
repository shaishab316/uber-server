import colors from 'colors';
import { logger } from '../logger/logger';
import { getDB } from '../server/connectDB';

export async function setupIndexes() {
  logger.info(colors.green('🔑 DB Indexes setup started...'));
  try {
    await getDB()!
      .collection('available_drivers')
      .createIndex(
        { 'location.geo': '2dsphere' },
        { background: true, name: 'location_2dsphere' },
      );
  } catch {
    void 0;
  } finally {
    logger.info(colors.green('✅ DB Indexes setup successfully'));
  }
}
