import z from 'zod';
import { LoanValidations } from './Loan.validation';

export type TStartLoan = z.infer<typeof LoanValidations.startLoan>['body'] & {
  user_id: string;
};
