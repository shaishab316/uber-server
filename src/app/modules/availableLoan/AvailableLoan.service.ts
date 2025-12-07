import { prisma } from '../../../utils/db';
import { TPagination } from '../../../utils/server/serveResponse';
import { TList } from '../query/Query.interface';
import {
  TAvailableLoanCreateArgs,
  TAvailableLoanDeleteArgs,
  TAvailableLoanUpdateArgs,
} from './AvailableLoan.interface';

export const AvailableLoanServices = {
  async create(payload: TAvailableLoanCreateArgs) {
    return prisma.availableLoan.create({ data: payload });
  },

  async update({ loan_id, ...payload }: TAvailableLoanUpdateArgs) {
    return prisma.availableLoan.update({
      where: { id: loan_id },
      data: payload,
    });
  },

  async delete({ loan_id }: TAvailableLoanDeleteArgs) {
    return prisma.availableLoan.delete({
      where: { id: loan_id },
    });
  },

  async getAllLoans({
    limit,
    page,
    driver_id,
  }: TList & { driver_id?: string }) {
    const loans = await prisma.availableLoan.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        loans: {
          where: { driver_id },
        },
      },
    });

    const total = await prisma.availableLoan.count();

    return {
      loans: loans.map(({ loans, ...loan }) => ({
        ...loan,
        is_taken: Boolean(loans.length),
      })),
      meta: {
        pagination: {
          total,
          limit,
          page,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
    };
  },

  async getLoanById(load_id: string) {
    return prisma.availableLoan.findUnique({
      where: { id: load_id },
    });
  },
};
