import { ErrorRequestHandler, RequestHandler } from 'express';
import { socketError } from '../modules/socket/Socket.utils';
import { Socket } from 'socket.io';

/**
 * Wraps an Express request handler to catch and handle async errors
 *
 * @param fn - The Express request handler function to wrap
 * @returns A wrapped request handler that catches async errors
 */
const catchAsync =
  (
    fn: RequestHandler<any, any, any, any>,
    errFn: ErrorRequestHandler | null = null,
  ): RequestHandler =>
  async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (errFn) await errFn(error, req, res, next);
      else next(error);
    }
  };

catchAsync.socket =
  // eslint-disable-next-line no-unused-vars
  <T>(fn: (data: T) => Promise<void>, socket: Socket) =>
    async (data: string) => {
      try {
        await fn(JSON.parse(data) as T);
      } catch (error: any) {
        socketError(socket, error);
      }
    };

export default catchAsync;
