import http from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import config from '../../../config';
import auth from '../../middlewares/socketAuth';
import { TAuthenticatedSocket } from './Socket.interface';
import socketPlugins from './Socket.plugin';
import { logger } from '../../../util/logger/logger';

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

        logger.info(`👤 User (${user?.name}) connected to room: (${user.id})`);

        socket.on('leave', (roomId: string) => {
          logger.info(`👤 User (${user?.name}) left from room: (${roomId})`);
          socket.leave(roomId);
        });

        socket.on('disconnect', () => {
          logger.info(
            `👤 User (${user?.name}) disconnected from room: (${user.id})`,
          );
          this.offline(user.id);
          socket.leave(user.id);
        });

        socket.on('error', error => {
          logger.error(error);
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
        logger.error(error);
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
