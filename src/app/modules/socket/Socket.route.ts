import ChatSocket from '../chat/Chat.socket';
import TripSocket from '../trip/Trip.socket';
import { TSocketHandler } from './Socket.interface';

const router = new Map<string, TSocketHandler>();
{
  router.set('/chat', ChatSocket);
  router.set('/trip', TripSocket);
}

export const SocketRoutes = router;
