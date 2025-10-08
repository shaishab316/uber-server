import { StatusCodes } from 'http-status-codes';
import { ELoanStatus, Prisma } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import {
  availableLoans,
  loanSearchableFields as searchableFields,
} from './Loan.constant';
import { TStartLoan, TSuperGetAllLoans } from './Loan.interface';
import { TPagination } from '../../../utils/server/serveResponse';

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

  //! admin
  async superGetAllLoans({ limit, page, search, status }: TSuperGetAllLoans) {
    const where: Prisma.LoanWhereInput = {};

    if (status) where.status = status;

    if (search) {
      where.OR = searchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const loans = await prisma.loan.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.loan.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        query: {
          search,
          status,
        },
      },
      loans,
    };
  },

  async superAcceptLoan(loan_id: string) {
    return prisma.loan.update({
      where: { id: loan_id },
      data: { status: ELoanStatus.ACCEPTED },
    });
  },

  async superRejectLoan(loan_id: string) {
    return prisma.loan.update({
      where: { id: loan_id },
      data: { status: ELoanStatus.REJECTED },
    });
  },

  async superPayLoan(loan_id: string) {
    return prisma.loan.update({
      where: { id: loan_id },
      data: { status: ELoanStatus.PAID },
    });
  },
};
