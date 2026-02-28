import type { z } from 'zod';
import type { TopupValidations } from './Topup.validation';

/************************************/
/******* Validation Interface *******/
/************************************/

export type TGenerateTopupLink = z.infer<
  typeof TopupValidations.generateTopupLink
>;
export type TGenerateTopupLinkPayload = TGenerateTopupLink['body'] & {
  user_id: string;
};
