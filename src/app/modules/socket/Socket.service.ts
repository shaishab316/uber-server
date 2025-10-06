import http from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import config from '../../../config';
import { SocketRoutes } from './Socket.route';
import auth from '../../middlewares/socketAuth';
import { TAuthenticatedSocket } from './Socket.interface';
import { logger } from '../../../utils/logger/logger';
import { notFoundError } from '../../../errors';
import { formatError } from '../../middlewares/globalErrorHandler';

type OnlineMap = Record<string, Set<string>>;

let io: IOServer | null = null;
const onlineUsers: OnlineMap = {};

export const SocketServices = {
  init(server: http.Server) {
    if (io) return;

    io = new IOServer(server, {
      cors: { origin: config.server.allowed_origins },
    });

    // Reject connections on the default namespace '/'
    io.on('connection', (socket: Socket) => {
      socket.emit('error', JSON.stringify(formatError(notFoundError('/'))));
      setTimeout(() => {
        socket.disconnect(true);
      }, 50);
    });

    // Attach cleanup on server close
    server.on('close', this.cleanup);

    // Initialize each namespace
    SocketRoutes.forEach((handler, namespace) => {
      const nsp = io!.of(namespace);
      onlineUsers[namespace] = new Set();

      nsp.use(auth);
      nsp.on('connection', (socket: TAuthenticatedSocket) => {
        const { user } = socket.data;

        // Join private room
        socket.join(user.id);
        this.markOnline(namespace, user.id);

        logger.info(
          `👤 User (${user.name}) connected to namespace: ${namespace}`,
        );

        // Event: leave room
        socket.on('leave', (roomId: string) => {
          socket.leave(roomId);
          logger.info(`👤 User (${user.name}) left room: ${roomId}`);
        });

        // Event: disconnect
        socket.on('disconnect', () => {
          socket.leave(user.id);
          this.markOffline(namespace, user.id);
          logger.info(
            `👤 User (${user.name}) disconnected from namespace: ${namespace}`,
          );
        });

        // Event: error
        socket.on('error', err => {
          logger.error(err);
        });

        // Call module-specific handler
        try {
          handler(nsp, socket);
        } catch (err) {
          logger.error(`Namespace "${namespace}" handler error:`, err);
        }
      });
    });
  },

  markOnline(namespace: string, userId: string) {
    onlineUsers[namespace].add(userId);
    this.emitOnline(namespace);
  },

  markOffline(namespace: string, userId: string) {
    onlineUsers[namespace].delete(userId);
    this.emitOnline(namespace);
  },

  emitOnline(namespace: string) {
    io?.of(namespace).emit('online_users', Array.from(onlineUsers[namespace]));
  },

  getIO(): IOServer | null {
    return io;
  },

  cleanup() {
    if (!io) return;
    Object.keys(onlineUsers).forEach(ns => onlineUsers[ns].clear());
    io.close(() => logger.info('Socket.IO server closed.'));
    io = null;
  },
};
