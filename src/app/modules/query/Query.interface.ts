import type { z } from 'zod';
import type { QueryValidations } from './Query.validation';

export type TList = z.infer<typeof QueryValidations.list>['query'];
