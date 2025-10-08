import './prototype'; //! must be first
import startServer from './utils/server/startServer';
import { SocketServices } from './app/modules/socket/Socket.service';

startServer().then(server => {
  SocketServices.init(server);
});
