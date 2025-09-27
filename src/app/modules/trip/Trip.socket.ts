import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../util/db';
import catchAsync from '../../middlewares/catchAsync';
import { TSocketHandler } from '../socket/Socket.interface';
import { TripValidations } from './Trip.validation';
import { TTripJoin } from './Trip.interface';

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
      },
      socket,
      TripValidations.joinTrip,
    ),
  );
};

export default TripSocket;
