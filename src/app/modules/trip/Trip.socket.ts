import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import { TSocketHandler } from '../socket/Socket.interface';
import { TripValidations } from './Trip.validation';
import { TripServices } from './Trip.service';
import { getDistance, TLocationGeo } from '../../../utils/location';
import { tripNotificationMaps } from './Trip.utils';
import { tripOmit } from './Trip.constant';
import { EUserRole } from '../../../../prisma';
import { catchAsyncSocket, socketResponse } from '../socket/Socket.utils';
import { AvailableDriverServices } from '../availableDriver/AvailableDriver.service';

const TripSocket: TSocketHandler = async (io, socket) => {
  const { user } = socket.data;

  //! Launch started trip quickly
  await TripServices.launchStartedTrip({ io, socket });

  //! delete offline driver from availableDriver
  socket.on(
    'disconnect',
    async () => await AvailableDriverServices.leave({ driver_id: user.id }),
  );

  const isUser = user.role === EUserRole.USER;

  socket.on(
    'join_trip_room',
    catchAsyncSocket(async ({ trip_id }) => {
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
    catchAsyncSocket(async ({ location, trip_id }) => {
      const trip = await TripServices.updateTripLocation({
        user_id: user.id,
        trip_id,
        location,
      });

      socket.to(trip_id).emit(
        'update_trip_location',
        socketResponse({
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
          socketResponse({
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
