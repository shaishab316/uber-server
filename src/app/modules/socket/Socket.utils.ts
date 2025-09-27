import { Socket } from 'socket.io';
import colors from 'colors';
import { errorLogger, logger } from '../../../util/logger/logger';
import { ZodError } from 'zod';
import handleZodError from '../../../errors/handleZodError';
import { defaultError } from '../../middlewares/globalErrorHandler';

export const socketError = (socket: Socket, error: Error) => {
  const errorObj = defaultError;

  if (error instanceof ZodError) Object.assign(errorObj, handleZodError(error));

  socket.emit('socket_error', JSON.stringify(errorObj));

  errorLogger.error(colors.red(errorObj.message));
};

export const socketInfo = (socket: Socket, message: string) => {
  socket.emit('socket_log', message);
  logger.info(colors.green(message));
};
