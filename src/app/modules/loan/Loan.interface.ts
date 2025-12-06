import z from 'zod';
import { LoanValidations } from './Loan.validation';
import { TList } from '../query/Query.interface';
import { User } from '../../../../prisma';

export type TSuperGetAllLoans = z.infer<
  typeof LoanValidations.superGetAllLoans
>['query'] &
  TList;

export type TStartLoan = z.infer<typeof LoanValidations.startLoan>['body'] & {
  driver: Pick<User, 'id' | 'name'>;
};
