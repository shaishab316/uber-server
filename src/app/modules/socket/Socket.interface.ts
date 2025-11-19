/* eslint-disable no-unused-vars */
import { Server, Socket } from 'socket.io';
import { User as TUser } from '../../../../prisma';

export type TSocketHandler = (io: Server, socket: TAuthenticatedSocket) => void;

export interface TAuthenticatedSocket extends Socket {
  data: {
    user: TUser;
  };
}
