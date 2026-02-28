import catchAsync from '../../middlewares/catchAsync';
import type { TCheckoutSession, TGenerateTopupLink } from './Topup.interface';
import { TopupServices } from './Topup.service';

/**
 * Controller for handling topup-related HTTP requests, such as generating topup links.
 */
export const TopupControllers = {
  /**
   * Generates a topup link for the authenticated user based on the provided amount and provider. This controller validates the request, calls the service to create a topup link, and returns the link in the response. It also tracks user activity if specified in the response.
   */
  generateTopupLink: catchAsync<TGenerateTopupLink>(async ({ user, body }) => {
    const data = await TopupServices.generateTopupLink({
      ...body,
      user_id: user.id,
    });

    return {
      message: 'Topup link generated successfully',
      data,
    };
  }),

  /**
   * Handles the checkout session for a topup by validating the session ID, retrieving the corresponding topup session from the database, and initiating the appropriate payment flow based on the provider specified in the topup session. Currently supports AZUL as a payment provider. If the session is not found or if an unsupported provider is specified, an appropriate error is thrown.
   */
  checkoutSession: catchAsync<TCheckoutSession>(async ({ query }, res) => {
    await TopupServices.checkoutSession({
      ...query,
      res,
    });
  }),
};
