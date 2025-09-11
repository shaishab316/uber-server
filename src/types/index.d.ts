/* eslint-disable no-var */
import { User as TUser } from '../../prisma';
import { Server as TIOServer, Socket as TIOSocket } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      user: TUser;
      tempFiles: string[];
    }
  }

  var socket: TIOSocket | null;
  var io: TIOServer | null;
}
