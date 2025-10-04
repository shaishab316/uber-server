import ChatSocket from '../chat/Chat.socket';
import TripSocket from '../trip/Trip.socket';
import { TSocketHandler } from './Socket.interface';

const socketPlugins: TSocketHandler[] = [ChatSocket, TripSocket];

export default socketPlugins;
