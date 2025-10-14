import { PrismaClient } from '../../../prisma';
import { modelModifiers } from '../../app/modules/modelModifiers';

export const prisma = new Proxy(new PrismaClient(), {
  get(target, modelName) {
    const model = target[modelName as keyof typeof target];
    if (typeof model !== 'object') return model;

    return new Proxy(model, {
      get(obj, methodName) {
        const origMethod = obj[methodName as keyof typeof obj];
        if (typeof origMethod !== 'function') return origMethod;

        return async (...args: any[]) => {
          const result = await origMethod.apply(obj, args);

          const modifier = modelModifiers[modelName as any];
          if (!modifier || !result) return result;

          return Array.isArray(result)
            ? result.map(modifier)
            : modifier(result);
        };
      },
    });
  },
});
