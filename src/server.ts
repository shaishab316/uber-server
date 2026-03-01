import startServer from './utils/server/startServer';
import { SocketServices } from './app/modules/socket/Socket.service';
import { registerCronJobs } from './cron';

//? Entry point of the application
startServer().then(server => {
  //? Initialize WebSocket services after server is up
  SocketServices.init(server);

  //? Register cron jobs after server is up
  registerCronJobs();
});
