import { Router } from 'express';
import { LoanControllers } from './Loan.controller';

const driver = Router();
{
  driver.get('/', LoanControllers.getAllLoans);
}

export const LoanRoutes = { driver };
