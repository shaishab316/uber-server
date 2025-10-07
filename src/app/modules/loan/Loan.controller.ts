import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../utils/server/serveResponse';
import { availableLoans } from './Loan.constant';

export const LoanControllers = {
  getAllLoans: catchAsync(async (_, res) => {
    serveResponse(res, {
      message: 'Loans retrieved successfully!',
      data: availableLoans,
    });
  }),
};
