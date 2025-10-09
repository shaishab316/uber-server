import { Router } from 'express';
import { PaymentControllers } from './Payment.controller';

export const PaymentRoutes = Router().all(
  '/stripe/webhook',
  PaymentControllers.stripeWebhook,
);
