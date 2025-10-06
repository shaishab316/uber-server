/* eslint-disable no-unused-vars */
import { Socket } from 'socket.io';
import { decodeToken } from '../modules/auth/Auth.utils';
import { prisma } from '../../utils/db';
import { userOmit } from '../modules/user/User.service';

const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake?.auth?.token; //!Todo: if query auth needed ?? socket.handshake?.query?.token;

  try {
    const { uid } = decodeToken(token, 'access_token');

    const user = await prisma.user.findUnique({
      where: { id: uid },
      omit: userOmit,
    });

    if (!user) throw new Error('User not found');

    Object.assign(socket.data, { user });

    next();
  } catch (error: any) {
    next(error);
  }
};

export default socketAuth;
