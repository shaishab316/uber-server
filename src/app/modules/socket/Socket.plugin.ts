import fg from 'fast-glob';
import { TSocketHandler } from './Socket.interface';
import { errorLogger } from '../../../util/logger/logger';

export const initSocketHandlers = async (): Promise<TSocketHandler[]> => {
  const files = await fg('src/app/modules/**/*.socket.{ts,js}', {
    cwd: process.cwd(),
    ignore: ['node_modules', '**/*.test.*', '**/*.spec.*'],
    absolute: true,
  });

  const importPromises = files.map(
    async (file): Promise<TSocketHandler | null> => {
      try {
        const module = await import(file);

        if (module.default) {
          return module.default as TSocketHandler;
        }
      } catch (error) {
        errorLogger.error(`Failed to load socket handler from ${file}:`, error);
      }
      return null;
    },
  );

  const results = await Promise.all(importPromises);
  return results.filter(
    (handler): handler is TSocketHandler => handler !== null,
  );
};
