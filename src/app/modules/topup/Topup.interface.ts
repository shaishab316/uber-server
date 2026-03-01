import type { z } from 'zod';
import type { TopupValidations } from './Topup.validation';
import type { Topup as TTopup, User as TUser } from '../../../../prisma';
import type { Response } from 'express';

/************************************/
/******* Validation Interface *******/
/************************************/

export type TGenerateTopupLink = z.infer<
  typeof TopupValidations.generateTopupLink
>;
export type TGenerateTopupLinkPayload = TGenerateTopupLink['body'] & {
  user_id: string;
};

export type TCheckoutSession = z.infer<typeof TopupValidations.checkoutSession>;
export type TCheckoutSessionPayload = TCheckoutSession['query'] & {
  res: Response;
};

/************************************/
/******* Service Interface *******/
/************************************/

export type TCheckoutAzulPaymentPayload = TTopup & {
  user: Pick<TUser, 'id' | 'name' | 'avatar'> | null;
} & {
  res: Response;
};
export type TCheckoutAzulPaymentTemplateData = Omit<
  TCheckoutAzulPaymentPayload,
  'res'
>;
