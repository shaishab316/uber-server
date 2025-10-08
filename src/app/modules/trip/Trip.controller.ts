import catchAsync from '../../middlewares/catchAsync';
import { TripServices } from './Trip.service';

export const TripControllers = {
  requestForTrip: catchAsync(async ({ body, user }) => {
    const trip = await TripServices.requestForTrip({
      ...body,
      passenger_id: user.id,
    });

    return {
      message: 'Trip started successfully!',
      data: trip,
    };
  }),

  rejectTrip: catchAsync(async ({ params, user, body }) => {
    await TripServices.rejectTrip({
      ...body,
      driver_id: user.id,
      trip_id: params.tripId,
    });

    return {
      message: 'Trip rejected successfully!',
    };
  }),

  acceptTrip: catchAsync(async ({ params, user, body }) => {
    await TripServices.acceptTrip({
      ...body,
      driver_id: user.id,
      trip_id: params.tripId,
    });

    return {
      message: 'Trip accepted successfully!',
    };
  }),

  startTrip: catchAsync(async ({ params, user, body }) => {
    await TripServices.startTrip({
      ...body,
      driver_id: user.id,
      trip_id: params.tripId,
    });

    return {
      message: 'Trip accepted successfully!',
    };
  }),

  updateTripLocation: catchAsync(async ({ params, body, user }) => {
    await TripServices.updateTripLocation({
      ...body,
      tripId: params.tripId,
      userId: user.id,
    });

    return {
      message: 'Trip location updated successfully!',
    };
  }),

  completeTrip: catchAsync(async ({ params, user, body }) => {
    await TripServices.completeTrip({
      ...body,
      driver_id: user.id,
      trip_id: params.tripId,
    });

    return {
      message: 'Trip completed successfully!',
    };
  }),
};
