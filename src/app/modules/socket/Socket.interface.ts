/* eslint-disable no-unused-vars */
import { Namespace, Socket } from 'socket.io';
import { User as TUser } from '../../../../prisma';

export type TSocketHandler = (
  io: Namespace,
  socket: TAuthenticatedSocket,
) => void;

export interface TAuthenticatedSocket extends Socket {
  data: {
    user: TUser;
  };
}
