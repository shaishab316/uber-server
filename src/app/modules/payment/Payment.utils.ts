import Stripe from 'stripe';
import config from '../../../config';

/**
 * Stripe instance
 */
export const stripe = new Stripe(config.payment.stripe.secret_key);

export const stripWebhookEventMap = {
  'checkout.session.completed': async (checkout: any) => {
    console.log('checkout.session.completed', checkout);
  },
};
