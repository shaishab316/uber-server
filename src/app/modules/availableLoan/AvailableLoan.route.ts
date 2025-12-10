import { Router } from 'express';
import { AvailableLoanControllers } from './AvailableLoan.controller';
import { AvailableLoanValidations } from './AvailableLoan.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { imageCapture } from '../newsFeed/NewsFeed.route';
import { QueryValidations } from '../query/Query.validation';
import { LoanValidations } from '../loan/Loan.validation';
import { LoanControllers } from '../loan/Loan.controller';
import capture from '../../middlewares/capture';

const admin = Router();
{
  /**
   * get all loans requested by drivers
   */
  admin.get(
    '/',
    purifyRequest(QueryValidations.list, LoanValidations.superGetAllLoans),
    LoanControllers.superGetAllLoans,
  );

  /**
   * get all available loans
   */
  admin.get(
    '/available-loans',
    purifyRequest(QueryValidations.list),
    AvailableLoanControllers.getAllLoans,
  );

  admin.get(
    '/available-loans/:loan_id',
    purifyRequest(QueryValidations.exists('loan_id', 'availableLoan')),
    AvailableLoanControllers.getLoanById,
  );

  /**
   * create new loan
   */
  admin.post(
    '/',
    imageCapture,
    purifyRequest(AvailableLoanValidations.create),
    AvailableLoanControllers.create,
  );

  /**
   * update a loan
   */
  admin.patch(
    '/',
    imageCapture,
    purifyRequest(AvailableLoanValidations.update),
    AvailableLoanControllers.update,
  );

  /**
   * delete a loan
   */
  admin.delete(
    '/',
    purifyRequest(AvailableLoanValidations.delete),
    AvailableLoanControllers.delete,
  );

  /**
   * Accept a loan request
   */
  admin.post(
    '/:loan_id',
    purifyRequest(QueryValidations.exists('loan_id', 'loan')),
    LoanControllers.superAcceptLoan,
  );

  /**
   * Reject a loan request
   */
  admin.delete(
    '/:loan_id',
    purifyRequest(QueryValidations.exists('loan_id', 'loan')),
    LoanControllers.superRejectLoan,
  );
}

const driver = Router();
{
  driver.get(
    '/',
    purifyRequest(QueryValidations.list),
    AvailableLoanControllers.getAllLoans,
  );

  driver.post(
    '/',
    capture({
      document: {
        fileType: 'any',
        maxCount: 1,
        size: 50 * 1024 * 1024, // 50 MB
      },
    }),
    purifyRequest(LoanValidations.startLoan),
    LoanControllers.startLoan,
  );

  driver.get(
    '/:loan_id',
    purifyRequest(QueryValidations.exists('loan_id', 'availableLoan')),
    AvailableLoanControllers.getLoanById,
  );
}

export const AvailableLoanRoutes = { admin, driver };
