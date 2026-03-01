import { Server } from 'http';
import { Server as IOServer } from 'socket.io';
import config from '../../../config';
import { SocketHandlers } from './Socket.route';
import auth from './Socket.middleware';
import { TAuthenticatedSocket } from './Socket.interface';
import { logger } from '../../../utils/logger';
import chalk from 'chalk';
import { prisma } from '../../../utils/db';

let io: IOServer | null = null;
const onlineUsers: Set<string> = new Set();

export const SocketServices = {
  init(server: Server) {
    if (io) return;

    io = new IOServer(server, {
      cors: { origin: config.server.allowed_origins },
    });

    logger.info(chalk.green('🚀 Socket services initialized successfully'));

    // Attach cleanup on server close
    server.once('close', this.cleanup);

    // Use single namespace
    io.use(auth);
    io.on('connection', (socket: TAuthenticatedSocket) => {
      const { user } = socket.data;

      // Join private room with user ID
      socket.join(user.id);
      this.markOnline(user.id);

      logger.info(`👤 User (${user.name}) connected`);

      // Event: leave room
      socket.on('leave', (roomId: string) => {
        socket.leave(roomId);
        logger.info(`👤 User (${user.name}) left room: ${roomId}`);
      });

      // Event: disconnect
      socket.on('disconnect', async () => {
        socket.leave(user.id);
        this.markOffline(user.id);
        logger.info(`👤 User (${user.name}) disconnected`);

        await prisma.user.update({
          where: { id: user.id },
          data: { last_online_at: new Date() },
          select: { id: true },
        });
      });

      // Event: error
      socket.on('error', logger.error);

      // Call all handlers
      try {
        Object.values(SocketHandlers).forEach(handler => {
          handler(io!, socket);
        });
      } catch (err) {
        logger.error('Socket handler error:', err);
      }
    });
  },

  markOnline(userId: string) {
    onlineUsers.add(userId);
    this.emitOnline();
  },

  markOffline(userId: string) {
    onlineUsers.delete(userId);
    this.emitOnline();
  },

  emitOnline() {
    io?.emit('online_users', Array.from(onlineUsers));
  },

  getIO(): IOServer | null {
    return io;
  },

  cleanup() {
    if (!io) return;
    onlineUsers.clear();
    io.close(() => logger.info('Socket.IO server closed.'));
    io = null;
  },
};
