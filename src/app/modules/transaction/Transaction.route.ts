import { Router } from 'express';
import { TransactionControllers } from './Transaction.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const user = Router();
{
  user.get(
    '/',
    purifyRequest(QueryValidations.list),
    TransactionControllers.getUserTransactions,
  );
}

const admin = Router();
{
  admin.get(
    '/',
    purifyRequest(QueryValidations.list),
    TransactionControllers.getSuperTransactions,
  );
}

export const TransactionRoutes = { user, admin };
