import { Socket } from 'socket.io';
import chalk from 'chalk';
import { errorLogger, logger } from '../../../util/logger/logger';
import { formatError } from '../../middlewares/globalErrorHandler';

export const socketError = (socket: Socket, error: Error) => {
  const formattedError = formatError(error);

  socket.emit('socket_error', JSON.stringify(formattedError));

  errorLogger.error(chalk.red(formattedError.message));
};

export const socketInfo = (socket: Socket, message: string) => {
  socket.emit('socket_log', message);
  logger.info(chalk.green(message));
};
