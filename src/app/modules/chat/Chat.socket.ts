import { StatusCodes } from 'http-status-codes';
import { EUserRole, Prisma } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../util/db';
import catchAsync from '../../middlewares/catchAsync';
import { MessageValidations } from '../message/Message.validation';
import { TSocketHandler } from '../socket/Socket.interface';
import { MessageServices } from '../message/Message.service';
import serveResponse from '../../../util/server/serveResponse';
import { ChatValidations } from './Chat.validation';

const ChatSocket: TSocketHandler = (io, socket) => {
  const { user } = socket.data;
  const isUser = user.role === EUserRole.USER;

  socket.on(
    'join_chat_room',
    catchAsync.socket(async ({ chat_id }) => {
      const chat = await prisma.chat.findFirst({
        where: {
          id: chat_id,
          OR: [{ user_id: user.id }, { driver_id: user.id }],
        },
      });

      if (!chat) throw new ServerError(StatusCodes.NOT_FOUND, 'Chat not found');

      socket.join(chat_id);

      return {
        message: 'Joined chat successfully',
        data: chat,
      };
    }, ChatValidations.joinChat),
  );

  socket.on(
    'send_message',
    catchAsync.socket(async ({ chat_id, content, media_type, media_url }) => {
      const chat = await prisma.chat.findUnique({
        where: {
          id: chat_id,
        },
      });

      const error = new ServerError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to send message to this chat',
      );

      const msgData: Prisma.MessageCreateArgs['data'] = {
        chat_id,
        content,
        media_type,
        media_url,
      };

      if (isUser) {
        msgData.user_id = user.id;
        if (chat?.user_id !== user.id) throw error;
      } else {
        msgData.driver_id = user.id;
        if (chat?.driver_id !== user.id) throw error;
      }

      const message = await MessageServices.createMsg(msgData);

      io.to(isUser ? chat?.driver_id : chat?.user_id).emit(
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
    }, MessageValidations.createMsg),
  );

  socket.on(
    'delete_message',
    catchAsync.socket(async ({ message_id }) => {
      const message = await MessageServices.deleteMsg({
        message_id,
        user_id: user.id,
      });

      io.to(message.chat_id).emit(
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
