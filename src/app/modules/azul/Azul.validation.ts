import z from 'zod';
import { exists } from '../../../utils/db/exists';

/**
 * Shared validation schemas for the Azul module. These schemas are used to validate incoming requests related to AZUL payment operations, ensuring that the data conforms to expected formats and constraints.`
 */
const _ = {
  amount: z
    .string()
    .regex(/^\d+$/)
    .refine(n => Number(n) > 0, 'Must be positive'),
  order_number: z
    .string()
    .length(24)
    .refine(exists('topup'), {
      error: ({ input }) => `Topup session with id "${input}" does not exist`,
    }),
};

/**
 * AzulValidation contains Zod schemas for validating requests related to AZUL payment operations. Each schema corresponds to a specific endpoint or action within the Azul module, ensuring that incoming data is properly structured and meets required criteria before processing.
 */
export const AzulValidation = {
  /**
   * Validation schema for verifying a payment. Validates the query parameters to ensure that all required fields are present and correctly formatted, including the order number, amount, authorization code, and authentication hash.
   */
  verifyPayment: z.object({
    query: z.object({
      OrderNumber: _.order_number,
      Amount: _.amount,
      AuthorizationCode: z.string(),
      DateTime: z.string(),
      ResponseCode: z.string(),
      IsoCode: z.string().length(2),
      ResponseMessage: z.string(),
      ErrorDescription: z.string().default(''),
      RRN: z.string().default(''),
      AuthHash: z.string(),
      AzulOrderId: z.string().default(''),
      CardNumber: z.string().default(''),
    }),
  }),
};
