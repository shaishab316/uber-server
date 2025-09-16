import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { TripServices } from './Trip.service';

export const TripControllers = {
  start: catchAsync(async ({ body, user }, res) => {
    const trip = await TripServices.start({ ...body, passenger_id: user.id });

    serveResponse(res, {
      message: 'Trip started successfully!',
      data: {
        trip_id: trip.id,
      },
    });
  }),

  rejectTrip: catchAsync(async ({ params, user, body }, res) => {
    await TripServices.rejectTrip({
      ...body,
      driver_id: user.id,
      trip_id: params.tripId,
    });

    serveResponse(res, {
      message: 'Trip rejected successfully!',
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
