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

  //! admin
  superGetAllLoans: catchAsync(async ({ query }, res) => {
    const { meta, loans } = await LoanServices.superGetAllLoans(query);

    serveResponse(res, {
      message: 'Loans retrieved successfully!',
      meta,
      data: loans,
    });
  }),

  superAcceptLoan: catchAsync(async ({ params }, res) => {
    const data = await LoanServices.superAcceptLoan(params.loanId);

    serveResponse(res, {
      message: 'Loan accepted successfully!',
      data,
    });
  }),

  superRejectLoan: catchAsync(async ({ params }, res) => {
    const data = await LoanServices.superRejectLoan(params.loanId);

    serveResponse(res, {
      message: 'Loan rejected successfully!',
      data,
    });
  }),

  superPayLoan: catchAsync(async ({ params }, res) => {
    const data = await LoanServices.superPayLoan(params.loanId);

    serveResponse(res, {
      message: 'Loan paid successfully!',
      data,
    });
  }),
};
