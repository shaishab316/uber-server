import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../util/db';
import catchAsync from '../../middlewares/catchAsync';
import { TSocketHandler } from '../socket/Socket.interface';
import { TripValidations } from './Trip.validation';
import { TripServices } from './Trip.service';
import { getDistance, TLocationGeo } from '../../../util/location';
import { tripNotificationMaps } from './Trip.util';
import { tripOmit } from './Trip.constant';
import serveResponse from '../../../util/server/serveResponse';
import { EUserRole } from '../../../../prisma';

const TripSocket: TSocketHandler = (io, socket) => {
  //! Launch started trip quickly
  TripServices.launchStartedTrip({ io, socket });

  const { user } = socket.data;
  const isUser = user.role === EUserRole.USER;

  socket.on(
    'join_trip_room',
    catchAsync.socket(async ({ trip_id }) => {
      const trip = (await prisma.trip.findFirst({
        where: { id: trip_id },
        omit: tripOmit,
      }))!;

      if (trip.passenger_id !== user.id && trip.driver_id !== user.id) {
        throw new ServerError(
          StatusCodes.UNAUTHORIZED,
          `You are not ${isUser ? 'passenger' : 'driver'} of this trip`,
        );
      }

      // Join room
      socket.join(trip.id);

      return {
        message: 'Joined trip successfully',
        data: trip,
        meta: { trip_id },
      };
    }, TripValidations.joinTrip),
  );

  socket.on(
    'update_trip_location',
    catchAsync.socket(async ({ location, trip_id }) => {
      const trip = await TripServices.updateTripLocation({
        user_id: user.id,
        trip_id,
        location,
      });

      socket.to(trip_id).emit(
        'update_trip_location',
        serveResponse.socket({
          message: `${user.name} updated trip's location`,
          data: location,
          meta: { trip_id },
        }),
      );

      //! notification job
      const distance = getDistance(
        trip.vehicle_address?.geo as TLocationGeo,
        trip.dropoff_address?.geo as TLocationGeo,
      );

      const closestNotification = tripNotificationMaps.find(
        notification => distance <= notification.distance,
      );

      const notification = closestNotification?.message;

      if (notification) {
        socket.to(trip.passenger_id).emit(
          'trip_notification',
          serveResponse.socket({
            message: notification,
            data: {
              distance,
            },
            meta: { trip_id },
          }),
        );
      }

      return {
        message: "Trip's location updated successfully!",
        data: location,
        meta: { trip_id },
      };
    }, TripValidations.updateTripLocation),
  );
};

export default TripSocket;
