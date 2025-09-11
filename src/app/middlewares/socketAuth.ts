/* eslint-disable no-unused-vars */
import { Socket } from 'socket.io';
import { socketError } from '../modules/socket/Socket.utils';
import { decodeToken } from '../modules/auth/Auth.utils';
import { prisma } from '../../util/db';
import { userOmit } from '../modules/user/User.service';

const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake?.auth?.token ?? socket.handshake?.query?.token;

  try {
    const { uid } = decodeToken(token, 'access_token');

    const user = await prisma.user.findUnique({
      where: { id: uid },
      omit: userOmit,
    });

    Object.assign(socket.data, { user });

    next();
  } catch (error) {
    socketError(socket, error as Error);
    setTimeout(socket.disconnect, 100);
  }
};

export default socketAuth;
