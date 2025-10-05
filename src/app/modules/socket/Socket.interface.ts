/* eslint-disable no-unused-vars */
import { Namespace, Socket } from 'socket.io';
import { User as TUser } from '../../../../prisma';

export type TSocketHandler = (io: Namespace, socket: Socket) => void;
export type TSocketPlugin = {
  [namespace: string]: TSocketHandler;
};

export interface TAuthenticatedSocket extends Socket {
  data: {
    user: TUser;
  };
}
