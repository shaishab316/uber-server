import catchAsync from '../../middlewares/catchAsync';
import { TripServices } from './Trip.service';

export const TripControllers = {
  requestForTrip: catchAsync(async ({ body, user }) => {
    const trip = await TripServices.requestForTrip({
      ...body,
      passenger_id: user.id,
    });

    return {
      message: 'Trip requested successfully! Look for a driver',
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

  cancelTrip: catchAsync(async ({ params, user, body }) => {
    await TripServices.cancelTrip({
      ...body,
      trip_id: params.tripId,
      passenger_id: user.id,
    });

    return {
      message: 'Trip canceled successfully!',
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

  arrivedTrip: catchAsync(async ({ params, user, body }) => {
    await TripServices.arrivedTrip({
      ...body,
      driver_id: user.id,
      trip_id: params.tripId,
    });

    return {
      message: 'Trip arrived successfully!',
    };
  }),

  completeTrip: catchAsync(async ({ params, user }) => {
    await TripServices.completeTrip({
      driver_id: user.id,
      trip_id: params.tripId,
    });

    return {
      message: 'Trip completed successfully!',
    };
  }),

  getTripHistory: catchAsync(async ({ query, user }) => {
    const { meta, trips } = await TripServices.getTripHistory({
      ...query,
      user_id: user.id,
    });

    return {
      message: 'Trip history retrieved successfully!',
      meta,
      data: trips,
    };
  }),

  superGetTripHistory: catchAsync(async ({ query }) => {
    const { meta, trips } = await TripServices.getTripHistory(query);

    return {
      message: 'Trip history retrieved successfully!',
      meta,
      data: trips,
    };
  }),
};
