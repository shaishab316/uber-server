import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../util/db';
import catchAsync from '../../middlewares/catchAsync';
import {
  TSocketHandler,
} from '../socket/Socket.interface';
import { TripValidations } from './Trip.validation';
import { TStartTrip, TTripJoin, TUpdateTripLocation } from './Trip.interface';
import { TripServices } from './Trip.service';
import { socketInfo } from '../socket/Socket.utils';

const TripSocket: TSocketHandler = (io, socket) => {
  socket.on(
    'join_trip_room',
    catchAsync.socket(
      async (payload: TTripJoin) => {
        const trip = await prisma.trip.findFirst({
          where: {
            id: payload.trip_id,
            OR: [
              { passenger_id: socket.data.user.id },
              { driver_id: socket.data.user.id },
            ],
          },
        });

        if (!trip)
          throw new ServerError(StatusCodes.NOT_FOUND, 'Trip not found');

        socket.join(trip.id);
        socketInfo(socket, `Joined trip room: ${trip.id}`);
      },
      socket,
      TripValidations.joinTrip,
    ),
  );

  socket.on(
    'update_trip_location',
    catchAsync.socket(
      async (payload: TUpdateTripLocation) => {
        await TripServices.updateTripLocation({
          user_id: socket.data.user.id,
          trip_id: payload.trip_id,
          location: payload.location,
        });

        socket
          .to(payload.trip_id)
          .emit('update_trip_location', JSON.stringify(payload));
      },
      socket,
      TripValidations.updateTripLocation,
    ),
  );

  socket.on(
    'start_trip',
    catchAsync.socket(async (payload: TStartTrip) => {
      const trip = await TripServices.startTrip({
        trip_id: payload.trip_id,
        passenger_id: socket.data.user.id,
      });

      socket.to(trip.id).emit('start_trip', JSON.stringify(trip));
    }, socket),
  );
};

export default TripSocket;
