import { StatusCodes } from 'http-status-codes';
import { ELoanStatus } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import { availableLoans } from './Loan.constant';
import { TStartLoan } from './Loan.interface';

export const LoanServices = {
  async startLoan({ loan_name, user_id, bank_account_no }: TStartLoan) {
    const loan = availableLoans.find(loan => loan.name === loan_name);
    const existingLoan = await prisma.loan.findFirst({
      where: {
        loan_name,
        driver_id: user_id,
        OR: [
          {
            status: ELoanStatus.PENDING,
          },
          {
            status: ELoanStatus.ACCEPTED,
          },
        ],
      },
    });

    if (existingLoan)
      throw new ServerError(StatusCodes.BAD_REQUEST, 'Loan already exists');

    return prisma.loan.create({
      data: {
        loan_name,
        amount: loan?.amount,
        driver_id: user_id,
        interest_rate: loan?.interest_rate,
        bank_account_no,
        due_amount: loan?.amount,
      },
    });
  },

  /**Todo: implement auto payment */
};
