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
import type { TVerifyPaymentPayload } from '../azul/Azul.interface';
import { AzulServices } from '../azul/Azul.service';
import { debug } from 'node:util';
import type { Prisma } from '../../../../prisma';

/**
 * AzulServices provides methods to interact with the AZUL payment gateway, including initiating payments by generating the required payload and authentication hash for AZUL's hosted payment page, as well as verifying payments by validating the incoming query parameters from AZUL's redirect after payment processing.
 */
export const debugLog = debug('app:payment:topup');

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
    const newTopup = await prisma.topup.create({
      data: {
        amount,
        provider,
        user_id,
      },
    });

    return {
      url: `${config.url.href}/api/v1/topup/checkout?session=${newTopup.id}`,
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

  /**
   * Initiates a payment by generating the required payload and authentication hash for AZUL's hosted payment page. This method constructs the necessary data fields based on the provided topup session information, including the amount, user details, and configuration settings. The generated payload is then used to redirect the user to AZUL's payment page, where they can complete the transaction.
   */
  async verifyPayment(
    payload: TVerifyPaymentPayload,
  ): Promise<{ topup_id: string }> {
    /**
     * Step 1: Verify the authenticity of the incoming payment data from AZUL by validating the authentication hash and ensuring that the transaction was successful based on the response code and ISO code. If the data is valid, extract the topup ID and amount from the payload for further processing.
     */
    const { topup_id, amount } = AzulServices.verifyPayment(payload);

    return prisma.$transaction(async tx => {
      const topup = await tx.topup.findUnique({
        where: { id: topup_id },
      });

      /**
       * Step 2: Ensure that topup and topup user exist.
       */
      if (!topup?.user_id) {
        throw new ServerError(
          StatusCodes.NOT_FOUND,
          `Topup session with id "${topup_id}" not found`,
        );
      }

      /**
       * Step 3: If the topup is already completed, return the topup ID without making any changes to the database. This prevents duplicate processing of the same payment in case of multiple callbacks from AZUL or if the user refreshes the page after completing the payment. If the topup is not completed, proceed to update the topup status and increment the user's wallet balance accordingly.
       */
      if (topup.is_completed) {
        return {
          topup_id,
        };
      }

      debugLog('Payment verified successfully for topup_id:', {
        topup_id,
        amount,
        topup,
      });

      const topupUpdateData: Prisma.TopupUpdateInput = { is_completed: true };

      //? If the amount in the database doesn't match the amount from the payload, update it to ensure consistency. This can happen if there was a change in the topup amount after the payment was initiated but before it was completed.
      if (topup.amount !== amount) {
        topupUpdateData.amount = amount;
      }

      /**
       * Step 4: Update the topup record in the database to mark it as completed and ensure that the amount is accurate. Then, increment the user's wallet balance by the amount of the topup. This step finalizes the payment process by reflecting the successful transaction in the database and updating the user's available balance for future transactions. Finally, return the topup ID as a confirmation of successful processing.
       */
      await tx.topup.update({
        where: { id: topup_id },
        data: topupUpdateData,
      });

      /**
       * Step 5: Increment the user's wallet balance by the amount of the topup. This is done after marking the topup as completed to ensure that only successful transactions result in a balance update. The amount is divided by 100 to convert it from cents to dollars (or the appropriate currency unit) before incrementing the balance.
       */
      await tx.wallet.update({
        where: { user_id: topup.user_id },
        data: {
          balance: {
            increment: Number((amount / 100).toFixed(2)),
          },
        },
      });

      return {
        topup_id,
      };
    });
  },
};
