import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { TripServices } from './Trip.service';

export const TripControllers = {
  start: catchAsync(async ({ body, user }, res) => {
    await TripServices.start({ ...body, passenger_id: user.id });

    serveResponse(res, {
      message: 'Trip started successfully!',
    });
  }),

  rejectTrip: catchAsync(async ({ params, user }, res) => {
    const data = await TripServices.rejectTrip(params.tripId, user.id);

    serveResponse(res, {
      message: 'Trip rejected successfully!',
      data,
    });
  }),

  updateTripLocation: catchAsync(async ({ params, body, user }, res) => {
    await TripServices.updateTripLocation({
      ...body,
      tripId: params.tripId,
      userId: user.id,
    });

    serveResponse(res, {
      message: 'Trip location updated successfully!',
    });
  }),
};
