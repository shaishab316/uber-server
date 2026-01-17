import { ELoanStatus, Prisma } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import { TStartLoan, TSuperGetAllLoans } from './Loan.interface';
import { TPagination } from '../../../utils/server/serveResponse';
import { loanSearchableFields } from './Loan.constant';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';

export const LoanServices = {
  async startLoan({ user, loan_id, ...payload }: TStartLoan) {
    const loanDetails = await prisma.availableLoan.findUnique({
      where: { id: loan_id },
    });

    if (!loanDetails) {
      throw new Error(`Available loan with id "${loan_id}" not found`);
    }

    return prisma.loan.create({
      data: {
        ...payload,
        loan_id,
        user_id: user.id,
        amount: loanDetails.amount,
        name: payload.name ?? user.name,
      },
    });
  },

  /**Todo: implement auto payment */

  //! admin
  async superGetAllLoans({ limit, page, search, status }: TSuperGetAllLoans) {
    const where: Prisma.LoanWhereInput = {};

    if (status) where.status = status;

    if (search) {
      where.OR = loanSearchableFields.map(field => ({
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
    return prisma.$transaction(async tx => {
      const error = new ServerError(
        StatusCodes.NOT_ACCEPTABLE,
        `Loan already processed`,
      );

      try {
        const loan = await tx.loan.update({
          where: { id: loan_id, status: ELoanStatus.PENDING },
          data: { status: ELoanStatus.PAID },
        });

        if (!loan) {
          throw error;
        }

        await tx.user.update({
          where: { id: loan.user_id },
          data: {
            wallet: {
              update: {
                balance: { increment: loan.amount },
              },
            },

            active_loan: { increment: loan.amount },
            loan_taken: { increment: loan.amount },
            available_loan: { decrement: loan.amount },
          },
        });
      } catch {
        throw error;
      }
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
