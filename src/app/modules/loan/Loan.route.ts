import { Router } from 'express';
import { LoanControllers } from './Loan.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { LoanValidations } from './Loan.validation';

const driver = Router();
{
  driver.get('/available', LoanControllers.getAllLoans);
  driver.post(
    '/start-loan',
    purifyRequest(LoanValidations.startLoan),
    LoanControllers.startLoan,
  );
}

export const LoanRoutes = { driver };
