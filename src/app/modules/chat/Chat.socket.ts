import { StatusCodes } from 'http-status-codes';
import { EUserRole, Prisma } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../util/db';
import catchAsync from '../../middlewares/catchAsync';
import { MessageValidations } from '../message/Message.validation';
import { TSocketHandler } from '../socket/Socket.interface';
import { MessageServices } from '../message/Message.service';
import serveResponse from '../../../util/server/serveResponse';

const ChatSocket: TSocketHandler = (io, socket) => {
  const { user } = socket.data;

  socket.on(
    'join_chat_room',
    catchAsync.socket(async (payload: { chat_id: string }) => {
      const chat = await prisma.chat.findFirst({
        where: {
          id: payload.chat_id,
          OR: [
            {
              user_id: socket.data.user.id,
            },
            {
              driver_id: socket.data.user.id,
            },
          ],
        },
      });

      if (!chat) throw new ServerError(StatusCodes.NOT_FOUND, 'Chat not found');

      socket.join(payload.chat_id);

      return {
        message: 'Joined chat successfully',
        data: chat,
      };
    }),
  );

  socket.on(
    'send_message',
    catchAsync.socket(async (payload: Prisma.MessageCreateArgs['data']) => {
      payload = await MessageValidations.createMsg.parseAsync(payload);

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

      io.to(
        user.role === EUserRole.USER ? chat?.driver_id : chat?.user_id,
      ).emit(
        'new_message',
        serveResponse.socket({
          message: `New message from ${user.name}`,
          data: message,
        }),
      );

      return {
        statusCode: StatusCodes.CREATED,
        message: 'Message sent successfully',
        data: message,
      };
    }),
  );

  socket.on(
    'delete_message',
    catchAsync.socket(async (payload: { message_id: string }) => {
      const message = await MessageServices.deleteMsg({
        message_id: payload.message_id,
        user_id: socket.data.user.id,
      });

      const chat = (await prisma.chat.findUnique({
        where: {
          id: message.chat_id,
        },
        select: {
          driver_id: true,
          user_id: true,
        },
      }))!;

      io.to(
        user.role === EUserRole.USER ? chat?.driver_id : chat?.user_id,
      ).emit(
        'delete_message',
        serveResponse.socket({
          message: `Message deleted by ${user.name}`,
          data: message,
        }),
      );

      return {
        message: 'Message deleted successfully',
        data: message,
      };
    }, MessageValidations.deleteMsg),
  );
};

export default ChatSocket;
