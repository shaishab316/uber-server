import { Loan as TLoan } from '../../../../prisma';

/** Todo: implement dynamic available loans */
export const availableLoans = [
  {
    name: 'Emergency Loan',
    amount: 1000,
    description: 'Quick cash for urgent needs',
    interest_rate: 2.5, //2.5%
    terms: '3-12 Months Terms',
  },
  {
    name: 'Vehicle Maintenance',
    amount: 5000,
    description: 'Quick cash for urgent needs',
    interest_rate: 2, //2%
    terms: '6-24 Months Terms',
  },
];

export const loanSearchableFields: (keyof TLoan)[] = [
  'bank_account_no',
  'driver_id',
];
