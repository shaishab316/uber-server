import config from '../../../config';
import { prisma } from '../../../utils/db';
import { TGenerateTopupLinkPayload } from './Topup.interface';

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
};
