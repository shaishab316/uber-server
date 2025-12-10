import { StatusCodes } from 'http-status-codes';
import serveResponse from '../../../utils/server/serveResponse';
import catchAsync from '../../middlewares/catchAsync';
import { AvailableLoanServices } from './AvailableLoan.service';

export const AvailableLoanControllers = {
  create: catchAsync(async (req, res) => {
    const data = await AvailableLoanServices.create(req.body);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'AvailableLoan created successfully!',
      data,
    });
  }),

  update: catchAsync(async (req, res) => {
    const data = await AvailableLoanServices.update(req.body);

    serveResponse(res, {
      message: 'AvailableLoan updated successfully!',
      data,
    });
  }),

  delete: catchAsync(async (req, res) => {
    const data = await AvailableLoanServices.delete(req.body);

    serveResponse(res, {
      message: 'AvailableLoan deleted successfully!',
      data,
    });
  }),

  getAllLoans: catchAsync(async ({ query, user: driver }, res) => {
    const { loans, meta } = await AvailableLoanServices.getAllLoans({
      ...query,
      driver_id: driver.id,
    });

    serveResponse(res, {
      message: 'AvailableLoans fetched successfully!',
      meta: {
        ...meta,
        available_loan: driver.available_loan,
        loan_taken: driver.loan_taken,
        active_loan: driver.active_loan,
      },
      data: loans,
    });
  }),

  getLoanById: catchAsync(async (req, res) => {
    const data = await AvailableLoanServices.getLoanById(req.params.loan_id);

    serveResponse(res, {
      message: 'AvailableLoan fetched successfully!',
      data,
    });
  }),
};
