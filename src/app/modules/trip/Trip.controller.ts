import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { TripServices } from './Trip.service';

export const TripControllers = {
  create: catchAsync(async (req, res) => {
    const data = await TripServices.create(req.body);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Trip created successfully!',
      data,
    });
  }),
};
