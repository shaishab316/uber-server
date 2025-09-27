import { Socket } from 'socket.io';
import colors from 'colors';
import { errorLogger, logger } from '../../../util/logger/logger';
import { formatError } from '../../middlewares/globalErrorHandler';

export const socketError = (socket: Socket, error: Error) => {
  const formattedError = formatError(error);

  socket.emit('socket_error', JSON.stringify(formattedError));

  errorLogger.error(colors.red(formattedError.message));
};

export const socketInfo = (socket: Socket, message: string) => {
  socket.emit('socket_log', message);
  logger.info(colors.green(message));
};
