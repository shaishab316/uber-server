import { z } from 'zod';
import { ELoanStatus } from '../../../../prisma';
import { enum_encode } from '../../../utils/transform/enum';
import { exists } from '../../../utils/db/exists';

export const LoanValidations = {
  startLoan: z.object({
    body: z.object({
      loan_id: z.string().refine(exists('availableLoan'), {
        error: ({ input }) => `Loan with id "${input}" does not exist`,
      }),
      bank_account_no: z.coerce
        .string({
          error: 'Bank account number is required',
        })
        .nonempty('Bank account number is required'),
    }),
  }),

  superGetAllLoans: z.object({
    query: z.object({
      status: z
        .string()
        .transform(enum_encode)
        .pipe(z.enum(ELoanStatus).optional())
        .optional(),
    }),
  }),
};
