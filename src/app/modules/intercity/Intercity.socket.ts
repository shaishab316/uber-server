import { TSocketHandler } from '../socket/Socket.interface';
import { EUserRole } from '../../../../prisma';
import { catchAsyncSocket, socketResponse } from '../socket/Socket.utils';
import { IntercityValidations } from './Intercity.validation';
import { prisma } from '../../../utils/db';

const IntercitySocket: TSocketHandler = async (io, socket) => {
  const { user } = socket.data;

  const isUser = user.role === EUserRole.USER;

  socket.on(
    'intercity:update_location',
    catchAsyncSocket(async ({ location, intercity_id }) => {
      await prisma.intercity.update({
        where: { id: intercity_id },
        data: {
          vehicle_address: location,
        },
      });

      console.log(
        `Emitting location update for intercity ${intercity_id}:`,
        location,
      );

      io.emit(`intercity:${intercity_id}:location_update`, {
        location,
      });

      return {
        message: 'Location updated successfully',
        data: location,
      };
    }, IntercityValidations.updateIntercityLocation),
  );
};

export default IntercitySocket;
