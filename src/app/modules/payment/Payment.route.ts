import { Router } from 'express';
import { PaymentControllers } from './Payment.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { PaymentValidations } from './Payment.validation';
import auth from '../../middlewares/auth';

const user = Router();
{
  user.all('/stripe/webhook', PaymentControllers.stripeWebhook);

  user.get(
    '/topup',
    auth.all,
    purifyRequest(PaymentValidations.topup),
    PaymentControllers.topup,
  );
}

export const PaymentRoutes = { user };
