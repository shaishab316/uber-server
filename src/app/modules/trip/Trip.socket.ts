import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../util/db';
import catchAsync from '../../middlewares/catchAsync';
import { TSocketHandler } from '../socket/Socket.interface';
import { TripValidations } from './Trip.validation';
import { TTripJoin, TUpdateTripLocation } from './Trip.interface';
import { TripServices } from './Trip.service';
import { getDistance, TLocationGeo } from '../../../util/location';
import { tripNotificationMaps } from './Trip.util';
import { tripOmit } from './Trip.constant';

const TripSocket: TSocketHandler = (io, socket) => {
  //! Launch started trip quickly
  TripServices.launchStartedTrip({ io, socket });

  const { user } = socket.data;

  socket.on(
    'join_trip_room',
    catchAsync.socket(async (payload: TTripJoin) => {
      const trip = await prisma.trip.findFirst({
        where: {
          id: payload.trip_id,
          OR: [{ passenger_id: user.id }, { driver_id: user.id }],
        },
        omit: tripOmit,
      });

      if (!trip) throw new ServerError(StatusCodes.NOT_FOUND, 'Trip not found');

      socket.join(trip.id);

      return {
        data: trip,
      };
    }, TripValidations.joinTrip),
  );

  socket.on(
    'update_trip_location',
    catchAsync.socket(async (payload: TUpdateTripLocation) => {
      const trip = await TripServices.updateTripLocation({
        user_id: user.id,
        trip_id: payload.trip_id,
        location: payload.location,
      });

      socket
        .to(payload.trip_id)
        .emit('update_trip_location', JSON.stringify(payload));

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
        socket
          .to(trip.passenger_id)
          .emit('trip_notification', JSON.stringify({ notification }));
      }

      return {};
    }, TripValidations.updateTripLocation),
  );
};

export default TripSocket;
