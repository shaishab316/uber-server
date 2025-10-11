import { Prisma, Transaction as TTransaction } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import { TPagination } from '../../../utils/server/serveResponse';
import { TList } from '../query/Query.interface';
import { transactionSearchableFields as searchableFields } from './Transaction.constant';

export const TransactionServices = {
  async create(transactionData: TTransaction) {
    return prisma.transaction.create({ data: transactionData });
  },

  async getTransactions({
    page,
    limit,
    user_id,
    search,
  }: TList & { user_id?: string }) {
    const where: Prisma.TransactionWhereInput = {};
    const omit: Prisma.TransactionOmit = {};

    if (user_id) {
      where.user_id = user_id;
      omit.user_id = true;
    }

    if (search) {
      where.OR = searchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const transactions = await prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      omit,
    });

    const total = await prisma.transaction.count({
      where,
    });

    const totalAmount = await prisma.transaction.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        totalAmount: totalAmount._sum.amount,
      },
      transactions,
    };
  },
};
