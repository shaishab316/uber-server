import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../utils/server/serveResponse';
import { availableLoans } from './Loan.constant';
import { LoanServices } from './Loan.service';

export const LoanControllers = {
  getAllLoans: catchAsync(async (_, res) => {
    serveResponse(res, {
      message: 'Loans retrieved successfully!',
      data: availableLoans,
    });
  }),

  startLoan: catchAsync(async ({ body, user }, res) => {
    const data = await LoanServices.startLoan({
      ...body,
      user_id: user.id,
    });

    serveResponse(res, {
      message: 'Loan started successfully!',
      data,
    });
  }),
};
