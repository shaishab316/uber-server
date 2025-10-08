import catchAsync from '../../middlewares/catchAsync';
import { availableLoans } from './Loan.constant';
import { LoanServices } from './Loan.service';

export const LoanControllers = {
  getAllLoans: catchAsync(async () => {
    return {
      message: 'Loans retrieved successfully!',
      data: availableLoans,
    };
  }),

  startLoan: catchAsync(async ({ body, user }) => {
    const data = await LoanServices.startLoan({
      ...body,
      user_id: user.id,
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
    const data = await LoanServices.superAcceptLoan(params.loanId);

    return {
      message: 'Loan accepted successfully!',
      data,
    };
  }),

  superRejectLoan: catchAsync(async ({ params }) => {
    const data = await LoanServices.superRejectLoan(params.loanId);

    return {
      message: 'Loan rejected successfully!',
      data,
    };
  }),

  superPayLoan: catchAsync(async ({ params }) => {
    const data = await LoanServices.superPayLoan(params.loanId);

    return {
      message: 'Loan paid successfully!',
      data,
    };
  }),
};
