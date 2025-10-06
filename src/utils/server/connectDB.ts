import { Db, GridFSBucket, MongoClient } from 'mongodb';
import chalk from 'chalk';
import config from '../../config';
import { logger } from '../logger/logger';

let client: MongoClient | null = null;
let bucket: GridFSBucket | null = null;
let db: Db | null = null;

export default async function connectDB() {
  client ??= new MongoClient(config.url.database);

  logger.info(chalk.green('🚀 Database connecting...'));
  await client.connect();
  logger.info(chalk.green('🚀 Database connected successfully'));

  db ??= client.db(config.server.db_name);
  bucket ??= new GridFSBucket(client.db(), { bucketName: 'files' });
}

export const getBucket = () => bucket;
export const getDB = () => db;
