import path from 'path';
import fg from 'fast-glob';
import { TSocketHandler } from './Socket.interface';

const handlers: TSocketHandler[] = [];

export const initSocketHandlers = async (): Promise<TSocketHandler[]> => {
  try {
    const files = await fg('src/app/modules/**/*.socket.ts', {
      cwd: process.cwd(),
      ignore: ['node_modules'],
      absolute: true,
    });

    for (const file of files) {
      const module = await import(path.resolve(process.cwd(), file));

      if (module.default) {
        handlers.push(module.default as TSocketHandler);
      }
    }

    return handlers;
  } catch {
    return [];
  }
};
