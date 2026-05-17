import chalk from 'chalk';
import dns from 'dns';
import { MongoClient } from 'mongodb';
import config from '../src/config';

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function setupIndexes() {
  const client = new MongoClient(config.url.database);

  console.log(chalk.green('🚀 Database connecting...'));
  await client.connect();
  console.log(chalk.green('🚀 Database connected successfully'));

  const db = client.db(config.server.db_name);

  console.log(chalk.green('🔑 DB Indexes setup started...'));
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

    {
      await db
        ?.collection('intercity')
        .createIndex(
          { 'pickup_address.geo': '2dsphere' },
          { background: true, name: 'pickup_address__2dsphere' },
        );

      await db
        ?.collection('intercity')
        .createIndex(
          { 'dropoff_address.geo': '2dsphere' },
          { background: true, name: 'dropoff_address__2dsphere' },
        );

      await db
        ?.collection('intercity')
        .createIndex(
          { 'vehicle_address.geo': '2dsphere' },
          { background: true, name: 'vehicle_address__2dsphere' },
        );

      await db
        ?.collection('intercity')
        .createIndex(
          { 'stops.geo': '2dsphere' },
          { background: true, name: 'stops__2dsphere' },
        );
    }
  } finally {
    console.log(chalk.green('✅ DB Indexes setup successfully'));
    await client.close();
    process.exit(0);
  }
}

setupIndexes().catch(error => {
  console.error(chalk.red('❌ DB Indexes setup failed'));
  console.error(error);
  process.exit(1);
});
