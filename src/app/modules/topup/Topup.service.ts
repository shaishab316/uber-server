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
import { debuglog as debug } from 'node:util';

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
    const { topup_id } = AzulServices.verifyPayment(payload);

    await prisma.$transaction(async tx => {
      /**
       * Step 2: Atomically mark the topup as completed ONLY if it hasn't been
       * completed yet (is_completed: false). This is a single DB operation —
       * no separate find + check + update — which eliminates the race condition
       * where two simultaneous AZUL callbacks could both pass the is_completed
       * check before either one writes to the DB.
       *
       * updateMany returns { count: number }
       *   count === 1  → we just completed it, proceed to update wallet
       *   count === 0  → another callback already completed it, skip wallet update
       */
      const { count: isNew } = await tx.topup.updateMany({
        where: {
          id: topup_id,
          is_completed: false, // ← KEY: only matches if NOT yet completed
        },
        data: {
          is_completed: true,
        },
      });

      if (!isNew) {
        debugLog('Topup already completed, skipping wallet update:', {
          topup_id,
        });

        return; //? Exit early if this topup was already completed by another callback
      }

      /**
       * Step 3: Now fetch the topup to get the amount and user_id.
       * We do this AFTER the atomic update, so we know we're the
       * "winner" of the race. No other callback can reach this point.
       */
      const topup = await tx.topup.findUnique({
        where: { id: topup_id },
      });

      if (!topup?.user_id) {
        throw new ServerError(
          StatusCodes.NOT_FOUND,
          `Topup session with id "${topup_id}" not found`,
        );
      }

      debugLog('Payment verified successfully, updating wallet:', {
        topup_id,
        topup,
      });

      /**
       * Step 4: Increment the user's wallet balance.
       * Amount stored in DB is in cents → divide by 100 for real currency value.
       */
      await tx.wallet.update({
        where: { user_id: topup.user_id },
        data: {
          balance: {
            increment: Number((topup.amount / 100).toFixed(2)),
          },
        },
      });
    });

    return { topup_id };
  },
};
