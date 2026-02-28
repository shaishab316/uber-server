import { StatusCodes } from 'http-status-codes';
import config from '../../../config';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import type {
  TCheckoutAzulPaymentPayload,
  TCheckoutSessionPayload,
  TGenerateTopupLinkPayload,
} from './Topup.interface';
import { azulTopupCheckoutTemplate } from './Topup.template';

/**
 * Service for handling topup-related operations, such as generating topup links and processing payments.
 */
export const TopupServices = {
  /**
   * Generates a topup link for the specified user, amount, and provider.
   */
  async generateTopupLink({
    user_id,
    amount,
    provider,
  }: TGenerateTopupLinkPayload) {
    const server_base_url = config.url.href;

    const newTopup = await prisma.topup.create({
      data: {
        amount,
        provider,
        user_id,
      },
    });

    return {
      url: `${server_base_url}/api/v1/topup/checkout?session=${newTopup.id}`,
    };
  },

  /**
   * Processes a checkout session by validating the session ID, retrieving the corresponding topup session from the database, and initiating the appropriate payment flow based on the provider specified in the topup session. Currently supports AZUL as a payment provider. If the session is not found or if an unsupported provider is specified, an appropriate error is thrown.
   */
  async checkoutSession({ session, res }: TCheckoutSessionPayload) {
    const topupSession = await prisma.topup.findUnique({
      where: { id: session },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!topupSession) {
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        `Topup session with id "${session}" not found`,
      );
    }

    switch (topupSession.provider) {
      case 'AZUL':
        return this.checkoutAzulPayment({ ...topupSession, res });
    }
  },

  /**
   * Handles the checkout process for AZUL payments by rendering an HTML template with the necessary data from the topup session. The rendered HTML is sent as the response to the client, allowing them to proceed with the payment through AZUL's platform. The template includes dynamic data such as the amount, user information, and provider details, which are populated based on the topup session retrieved from the database.
   */
  async checkoutAzulPayment({
    res,
    ...topupSession
  }: TCheckoutAzulPaymentPayload) {
    res.contentType('text/html');
    res.statusCode = StatusCodes.OK;
    res.send(azulTopupCheckoutTemplate(topupSession));
  },
};
