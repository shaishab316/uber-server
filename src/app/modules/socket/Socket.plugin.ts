import ChatSocket from '../chat/Chat.socket';
import TripSocket from '../trip/Trip.socket';
import { TSocketPlugin } from './Socket.interface';

export default {
  chat: ChatSocket,
  trip: TripSocket,
} as TSocketPlugin;
