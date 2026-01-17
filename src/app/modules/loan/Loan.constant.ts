import { Loan as TLoan } from '../../../../prisma';

export const loanSearchableFields = [
  'bank_account_number',
  'user_id',
  'problem',
  'name',
] as const satisfies Array<keyof TLoan>;
