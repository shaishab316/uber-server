import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../utils/server/serveResponse';
import { TripServices } from './Trip.service';

export const TripControllers = {
  requestForTrip: catchAsync(async ({ body, user }, res) => {
    const trip = await TripServices.requestForTrip({
      ...body,
      passenger_id: user.id,
    });

    serveResponse(res, {
      message: 'Trip started successfully!',
      data: trip,
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

  acceptTrip: catchAsync(async ({ params, user, body }, res) => {
    await TripServices.acceptTrip({
      ...body,
      driver_id: user.id,
      trip_id: params.tripId,
    });

    serveResponse(res, {
      message: 'Trip accepted successfully!',
    });
  }),

  startTrip: catchAsync(async ({ params, user, body }, res) => {
    await TripServices.startTrip({
      ...body,
      driver_id: user.id,
      trip_id: params.tripId,
    });

    serveResponse(res, {
      message: 'Trip accepted successfully!',
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

  completeTrip: catchAsync(async ({ params, user, body }, res) => {
    await TripServices.completeTrip({
      ...body,
      driver_id: user.id,
      trip_id: params.tripId,
    });

    serveResponse(res, {
      message: 'Trip completed successfully!',
    });
  }),
};
