import { DriverSocket } from '../driver/Driver.socket';
import { TSocketHandler } from './Socket.interface';

export const socketHandlers: TSocketHandler[] = [DriverSocket];
