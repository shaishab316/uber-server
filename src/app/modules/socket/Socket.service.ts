import http from 'http';
import { Server, Socket } from 'socket.io';
import config from '../../../config';
import auth from '../../middlewares/socketAuth';
import { socketError, socketInfo } from './Socket.utils';
import { socketHandlers } from './Socket.plugin';
import { User as TUser } from '../../../../prisma';

export let io: Server | null = null;
const onlineUsers = new Set<string>();

export const SocketServices = {
  init(server: http.Server) {
    io ??= new Server(server, {
      cors: { origin: config.server.allowed_origins },
    });

    io.use(auth);

    io.on('connection', socket => {
      const user: TUser = socket.data.user;

      socket.join(user.id);
      this.online(user.id);

      socketInfo(
        socket,
        `👤 User (${user?.name}) connected to room: (${user.id})`,
      );

      socket.on('leave', (chatId: string) => {
        socketInfo(
          socket,
          `👤 User (${user?.name}) left from room: (${chatId})`,
        );
        socket.leave(chatId);
      });

      socket.on('disconnect', () => {
        socketInfo(
          socket,
          `👤 User (${user?.name}) disconnected from room: (${user.id})`,
        );
        this.offline(user.id);
        socket.leave(user.id);
      });

      socket.on('error', error => {
        socketError(socket, error);
      });

      this.plugin(io!, socket);
    });
  },

  updateOnlineState() {
    io?.emit('onlineUsers', Array.from(onlineUsers));
  },

  online(userId: string) {
    onlineUsers.add(userId);
    this.updateOnlineState();
  },

  offline(userId: string) {
    onlineUsers.delete(userId);
    this.updateOnlineState();
  },

  plugin(io: Server, socket: Socket) {
    for (const handler of socketHandlers) {
      try {
        handler(io, socket);
      } catch (error: any) {
        socketError(socket, error.message);
      }
    }
  },
};
