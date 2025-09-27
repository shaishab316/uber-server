import { StatusCodes } from 'http-status-codes';
import { EUserRole, Prisma } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../util/db';
import catchAsync from '../../middlewares/catchAsync';
import { MessageValidations } from '../message/Message.validation';
import { TSocketHandler } from '../socket/Socket.interface';
import { MessageServices } from '../message/Message.service';

const ChatSocket: TSocketHandler = (io, socket) => {
  socket.on(
    'join_chat_room',
    catchAsync.socket(async (payload: { chat_id: string }) => {
      const chat = await prisma.chat.findUnique({
        where: {
          id: payload.chat_id,
        },
      });

      const error = new ServerError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to join to this chat',
      );

      if (!chat) throw new ServerError(StatusCodes.NOT_FOUND, 'Chat not found');

      if (socket.data.user.role === EUserRole.USER) {
        if (chat.user_id !== socket.data.user.id) throw error;
      } else if (chat.driver_id !== socket.data.user.id) throw error;

      socket.join(payload.chat_id);
    }, socket),
  );

  socket.on(
    'send_message',
    catchAsync.socket(async (payload: Prisma.MessageCreateArgs['data']) => {
      payload = await MessageValidations.create.parseAsync(payload);

      const chat = await prisma.chat.findUnique({
        where: {
          id: payload.chat_id,
        },
      });

      const error = new ServerError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to send message to this chat',
      );

      if (socket.data.user.role === EUserRole.USER) {
        payload.user_id = socket.data.user.id;
        if (chat?.user_id !== socket.data.user.id) throw error;
      } else {
        payload.driver_id = socket.data.user.id;
        if (chat?.driver_id !== socket.data.user.id) throw error;
      }

      const message = await MessageServices.createMsg(payload);

      io.to(payload.chat_id).emit('new_message', JSON.stringify(message));
    }, socket),
  );
};

export default ChatSocket;
