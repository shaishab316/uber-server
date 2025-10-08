import { Router } from 'express';
import { LoanControllers } from './Loan.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { LoanValidations } from './Loan.validation';
import { QueryValidations } from '../query/Query.validation';

const driver = Router();
{
  driver.get('/available', LoanControllers.getAllLoans);
  driver.post(
    '/start-loan',
    purifyRequest(LoanValidations.startLoan),
    LoanControllers.startLoan,
  );
}

const admin = Router();
{
  admin.get(
    '/',
    purifyRequest(QueryValidations.list, LoanValidations.superGetAllLoans),
    LoanControllers.superGetAllLoans,
  );
  admin.post(
    '/:loanId/accept-loan',
    purifyRequest(QueryValidations.exists('loanId', 'loan')),
    LoanControllers.superAcceptLoan,
  );
  admin.post(
    '/:loanId/reject-loan',
    purifyRequest(QueryValidations.exists('loanId', 'loan')),
    LoanControllers.superRejectLoan,
  );
  admin.post(
    '/:loanId/pay-loan',
    purifyRequest(QueryValidations.exists('loanId', 'loan')),
    LoanControllers.superPayLoan,
  );
}

export const LoanRoutes = { driver, admin };
