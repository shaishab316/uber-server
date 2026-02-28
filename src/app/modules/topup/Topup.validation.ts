import z from 'zod';
import { ETopupProvider } from '../../../../prisma';
import { exists } from '../../../utils/db/exists';

/**
 * Shared validation schemas for the Topup module. These schemas are used to validate incoming requests related to top-up operations, ensuring that the data conforms to expected formats and constraints.
 */
const _ = {
  amount: z.coerce
    .number()
    .positive()
    .transform(val => (val * 100) | 0), // Convert to cents and ensure it's an integer
  provider: z.enum(ETopupProvider),
};

/**
 * TopupValidations contains Zod schemas for validating requests related to top-up operations. Each schema corresponds to a specific endpoint or action within the Topup module, ensuring that incoming data is properly structured and meets required criteria before processing.
 */
export const TopupValidations = {
  /**
   * Validation schema for generating a top-up link. Validates the request body to ensure it contains a positive amount and a valid provider enum value.
   */
  generateTopupLink: z.object({
    body: z.object({
      amount: _.amount,
      provider: _.provider.default(ETopupProvider.AZUL),
    }),
  }),

  /**
   * Validation schema for the checkout session endpoint. Validates the query parameters to ensure that a valid session ID is provided, and that it corresponds to an existing top-up session in the database.
   */
  checkoutSession: z.object({
    query: z.object({
      session: z
        .string()
        .length(24)
        .refine(exists('topup'), {
          error: ({ input }) =>
            `Topup session with id "${input}" does not exist`,
        }),
    }),
  }),
};
