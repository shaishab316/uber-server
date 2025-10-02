import './util/prototype'; //! must be first
import startServer from './util/server/startServer';
import { SocketServices } from './app/modules/socket/Socket.service';
import chalk from 'chalk';
import { logger } from './util/logger/logger';

startServer().then(server => {
  SocketServices.init(server);
  logger.info(chalk.green('🚀 Socket services initialized successfully'));
});
