import { Loan as TLoan } from '../../../../prisma';

export const loanSearchableFields: (keyof TLoan)[] = [
  'bank_account_number',
  'driver_id',
  'problem',
  'name',
];
