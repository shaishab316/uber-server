import catchAsync from '../../middlewares/catchAsync';
import { LoanServices } from './Loan.service';

export const LoanControllers = {
  startLoan: catchAsync(async ({ body, user: driver }) => {
    const data = await LoanServices.startLoan({
      ...body,
      driver,
    });

    return {
      message: 'Loan started successfully!',
      data,
    };
  }),

  //! admin
  superGetAllLoans: catchAsync(async ({ query }) => {
    const { meta, loans } = await LoanServices.superGetAllLoans(query);

    return {
      message: 'Loans retrieved successfully!',
      meta,
      data: loans,
    };
  }),

  superAcceptLoan: catchAsync(async ({ params }) => {
    const data = await LoanServices.superAcceptLoan(params.loan_id);

    return {
      message: 'Loan accepted successfully!',
      data,
    };
  }),

  superRejectLoan: catchAsync(async ({ params }) => {
    const data = await LoanServices.superRejectLoan(params.loan_id);

    return {
      message: 'Loan rejected successfully!',
      data,
    };
  }),
};
