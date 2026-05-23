import ChatSocket from '../chat/Chat.socket';
import IntercitySocket from '../intercity/Intercity.socket';
import TripSocket from '../trip/Trip.socket';

export const SocketHandlers = {
  chat: ChatSocket,
  trip: TripSocket,
  intercity: IntercitySocket,
};
