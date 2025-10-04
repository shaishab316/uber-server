import http from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import config from '../../../config';
import auth from '../../middlewares/socketAuth';
import { socketError, socketInfo } from './Socket.utils';
import { TAuthenticatedSocket } from './Socket.interface';
import socketPlugins from './Socket.plugin';

let io: IOServer | null = null;
const onlineUsers = new Set<string>();

export const SocketServices = {
  async init(server: http.Server) {
    server.on('close', this.cleanup);

    io ??= new IOServer(server, {
      cors: { origin: config.server.allowed_origins },
    })
      .use(auth)
      .on('connection', (socket: TAuthenticatedSocket) => {
        const { user } = socket.data;

        socket.join(user.id);
        this.online(user.id);

        socketInfo(
          socket,
          `👤 User (${user?.name}) connected to room: (${user.id})`,
        );

        socket.on('leave', (roomId: string) => {
          socketInfo(
            socket,
            `👤 User (${user?.name}) left from room: (${roomId})`,
          );
          socket.leave(roomId);
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

        this.plugin(socket);
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

  plugin(socket: Socket) {
    for (const handler of socketPlugins) {
      try {
        handler(this.getIO()!, socket);
      } catch (error: any) {
        socketError(socket, error.message);
      }
    }
  },

  getIO() {
    return io;
  },

  cleanup() {
    this.getIO()?.close();
    onlineUsers.clear();
  },
};
