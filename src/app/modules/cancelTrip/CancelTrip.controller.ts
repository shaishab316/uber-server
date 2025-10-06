import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../utils/server/serveResponse';
import { CancelTripServices } from './CancelTrip.service';

export const CancelTripControllers = {
  getAllCancelTrip: catchAsync(async ({ query }, res) => {
    const { meta, cancelTrips } =
      await CancelTripServices.getAllCancelTrip(query);

    serveResponse(res, {
      message: 'Cancel trips retrieved successfully!',
      meta,
      data: cancelTrips,
    });
  }),
};
