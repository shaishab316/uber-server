import { z } from 'zod';
import { availableLoans } from './Loan.constant';
import { ELoanStatus } from '../../../../prisma';
import { enum_encode } from '../../../utils/transform/enum';

export const LoanValidations = {
  startLoan: z.object({
    body: z.object({
      loan_name: z
        .string()
        .refine(
          (name: string) => availableLoans.some(loan => loan.name === name),
          {
            error: `Loan name must be one of ${availableLoans.map(
              loan => loan.name,
            )}`,
            path: ['loan_name'],
          },
        ),
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
