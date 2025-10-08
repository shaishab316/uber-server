import { z } from 'zod';
import { availableLoans } from './Loan.constant';

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
      bank_account_no: z
        .string({
          error: 'Bank account number is required',
        })
        .nonempty('Bank account number is required'),
    }),
  }),
};
