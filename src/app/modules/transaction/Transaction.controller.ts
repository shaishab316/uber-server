import catchAsync from '../../middlewares/catchAsync';
import { TransactionServices } from './Transaction.service';

export const TransactionControllers = {
  getUserTransactions: catchAsync(async ({ user, query }) => {
    const { meta, transactions } =
      await TransactionServices.getUserTransactions({
        ...query,
        user_id: user.id,
      });

    return {
      message: 'Transactions retrieved successfully!',
      meta,
      data: transactions.map(transaction => ({
        ...transaction,
        amount: transaction.amount.toFixed(2),
      })),
    };
  }),

  getDriverTransactions: catchAsync(async ({ user, query }) => {
    const { meta, transactions } =
      await TransactionServices.getDriverTransactions({
        ...query,
        driver_id: user.id,
      });

    return {
      message: 'Transactions retrieved successfully!',
      meta,
      data: transactions.map(transaction => ({
        ...transaction,
        amount: transaction.amount.toFixed(2),
      })),
    };
  }),

  getSuperTransactions: catchAsync(async ({ query }) => {
    const { meta, transactions } =
      await TransactionServices.getAdminTransactions(query);

    return {
      message: 'Transactions retrieved successfully!',
      meta,
      data: transactions.map(transaction => ({
        ...transaction,
        amount: transaction.amount.toFixed(2),
      })),
    };
  }),
};
