import z from 'zod';
import { ReferValidations } from './Refer.validation';

export type THandleReferenceBonusArgs = {
  user_id: string;
  refer_id: number;
};

export type TReferredAble = z.infer<typeof ReferValidations.refer>['query'];
