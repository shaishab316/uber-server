import http from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import config from '../../../config';
import auth from '../../middlewares/socketAuth';
import { socketError, socketInfo } from './Socket.utils';
import { TAuthenticatedSocket, TSocketHandler } from './Socket.interface';
import { initSocketHandlers } from './Socket.plugin';
import { TripServices } from '../trip/Trip.service';

let io: IOServer | null = null;
const handlers: TSocketHandler[] = [];
const onlineUsers = new Set<string>();

export const SocketServices = {
  async init(server: http.Server) {
    //! use socket plugin
    if (!handlers.length) handlers.push(...(await initSocketHandlers()));

    io ??= new IOServer(server, {
      cors: { origin: config.server.allowed_origins },
    })
      .use(auth)
      .on('connection', (socket: TAuthenticatedSocket) => {
        const { user } = socket.data;

        //! Launch started trip quickly
        TripServices.launchStartedTrip({ io, socket });

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
    this.getIO()?.emit('online_users', Array.from(onlineUsers));
  },

  online(userId: string) {
    onlineUsers.add(userId);
    this.updateOnlineState();
  },

  offline(userId: string) {
    onlineUsers.delete(userId);
    this.updateOnlineState();
  },

  plugin(io: IOServer, socket: Socket) {
    for (const handler of handlers) {
      try {
        handler(io, socket);
      } catch (error: any) {
        socketError(socket, error.message);
      }
    }
  },

  getIO() {
    return io;
  },

  cleanup() {
    if (io) {
      io.close();
      io = null;
    }
    onlineUsers.clear();
    handlers.length = 0;
  },
};
