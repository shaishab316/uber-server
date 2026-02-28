import catchAsync from '../../middlewares/catchAsync';
import type { TGenerateTopupLink } from './Topup.interface';
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
};
