import chalk from 'chalk';
import config from '../../../config';
import catchAsync from '../../middlewares/catchAsync';
import { stripe, stripWebhookEventMap } from './Payment.utils';
import { StatusCodes } from 'http-status-codes';
import { errorLogger } from '../../../utils/logger/logger';
import { TStripWebhookEvent } from './Payment.interface';

export const PaymentControllers = {
  stripeWebhook: catchAsync(
    async ({ body, headers }, res) => {
      const sig = headers['stripe-signature'] as string;

      const event = stripe.webhooks.constructEvent(
        body,
        sig,
        config.payment.stripe.web_hook_secret,
      );

      const eventHandler =
        stripWebhookEventMap[event.type as TStripWebhookEvent];

      if (!eventHandler)
        return res.status(StatusCodes.NOT_FOUND).json({ received: true });

      await eventHandler(event.data.object);

      res.json({ received: true });
    },
    (error, _req, _res, next) => {
      errorLogger.error(
        chalk.red('🚨 stripeWebhook ~~ '),
        error.message,
        JSON.stringify(error.stack, null, 2),
      );

      next(error);
    },
  ),
};
