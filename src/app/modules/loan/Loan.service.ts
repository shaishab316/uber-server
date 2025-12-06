import { ELoanStatus, Prisma } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import { TStartLoan, TSuperGetAllLoans } from './Loan.interface';
import { TPagination } from '../../../utils/server/serveResponse';

export const LoanServices = {
  async startLoan({ driver, loan_id, ...payload }: TStartLoan) {
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
        driver_id: driver.id,
        amount: loanDetails.amount,
        name: payload.name ?? driver.name,
      },
    });
  },

  /**Todo: implement auto payment */

  //! admin
  async superGetAllLoans({ limit, page, search, status }: TSuperGetAllLoans) {
    const where: Prisma.LoanWhereInput = {};

    if (status) where.status = status;

    if (search) {
      // where.OR = searchableFields.map(field => ({
      //   [field]: {
      //     contains: search,
      //     mode: 'insensitive',
      //   },
      // }));
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
