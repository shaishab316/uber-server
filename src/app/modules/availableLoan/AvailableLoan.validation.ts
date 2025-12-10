import { z } from 'zod';

export const AvailableLoanValidations = {
  create: z.object({
    body: z.object({
      name: z.string({
        error: 'Name is required',
      }),
      amount: z.coerce.number({
        error: 'Amount is required',
      }),
      description: z.string({
        error: 'Description is required',
      }),
      interest_rate: z.coerce.number({
        error: 'Interest rate is required',
      }),
      terms: z.string({
        error: 'Terms is required',
      }),
      image: z.string({
        error: 'Image is required',
      }),
    }),
  }),

  update: z.object({
    body: z.object({
      loan_id: z.string({
        error: 'Loan ID is required',
      }),
      name: z.string().optional(),
      amount: z.coerce.number().optional(),
      description: z.string().optional(),
      interest_rate: z.coerce.number().optional(),
      terms: z.string().optional(),
      image: z.string().optional().nullable(),
    }),
  }),

  delete: z.object({
    body: z.object({
      loan_id: z.string({
        error: 'Loan ID is required',
      }),
    }),
  }),
};
