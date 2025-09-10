import './util/prototype'; //! must be first
import startServer from './util/server/startServer';
import { SocketServices } from './app/modules/socket/Socket.service';
import colors from 'colors';
import { logger } from './util/logger/logger';

startServer().then(server => {
  SocketServices.init(server);
  logger.info(colors.green('🚀 Socket services initialized successfully'));
});
