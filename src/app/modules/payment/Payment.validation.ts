import z from 'zod';

export const PaymentValidations = {
  topup: z.object({
    body: z.object({
      amount: z.coerce
        .number()
        .min(1, 'Amount must be greater than 0')
        .max(10000, 'Amount must be less than 10000'),
    }),
  }),
};
