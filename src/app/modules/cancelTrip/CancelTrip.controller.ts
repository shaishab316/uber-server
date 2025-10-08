import catchAsync from '../../middlewares/catchAsync';
import { CancelTripServices } from './CancelTrip.service';

export const CancelTripControllers = {
  getAllCancelTrip: catchAsync(async ({ query }) => {
    const { meta, cancelTrips } =
      await CancelTripServices.getAllCancelTrip(query);

    return {
      message: 'Cancel trips retrieved successfully!',
      meta,
      data: cancelTrips,
    };
  }),
};
