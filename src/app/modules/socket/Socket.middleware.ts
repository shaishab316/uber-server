/* eslint-disable no-unused-vars */
import { Socket } from 'socket.io';
import { decodeToken } from '../auth/Auth.utils';
import { prisma } from '../../../utils/db';
import { userOmit } from '../user/User.service';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';

const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  const token =
    socket.handshake?.auth?.token ?? socket.handshake.headers['authorization'];

  try {
    const { uid } = decodeToken(token, 'access_token');

    const user = await prisma.user.update({
      where: { id: uid },
      data: { last_online_at: new Date() },
      omit: userOmit,
    });

    if (!user) {
      throw new ServerError(StatusCodes.NOT_FOUND, 'Your account is not found');
    }

    Object.assign(socket.data, { user });

    next();
  } catch (error: any) {
    next(error);
  }
};

export default socketAuth;
