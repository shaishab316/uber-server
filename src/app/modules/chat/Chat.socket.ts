import { StatusCodes } from 'http-status-codes';
import { EUserRole, Prisma } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import { MessageValidations } from '../message/Message.validation';
import { TSocketHandler } from '../socket/Socket.interface';
import { MessageServices } from '../message/Message.service';
import { catchAsyncSocket, socketResponse } from '../socket/Socket.utils';

const ChatSocket: TSocketHandler = (io, socket) => {
  const { user } = socket.data;
  const isUser = user.role === EUserRole.USER;

  socket.on(
    'message:send',
    catchAsyncSocket(async ({ chat_id, content, media_type, media_urls }) => {
      const chat = await prisma.chat.findUnique({
        where: { id: chat_id },
      });

      const error = new ServerError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to send message to this chat',
      );

      const msgData: Prisma.MessageCreateArgs['data'] = {
        chat_id,
        content,
        media_type,
        media_urls,
      };

      if (isUser) {
        msgData.user_id = user.id;
        if (chat?.user_id !== user.id) throw error;
      } else {
        msgData.driver_id = user.id;
        if (chat?.driver_id !== user.id) throw error;
      }

      const {
        user: xUser,
        driver: xDriver,
        ...message
      } = await MessageServices.createMsg(msgData);
      const opponent = xUser ?? xDriver;

      const targetUserId = isUser ? chat?.driver_id : chat?.user_id;
      if (targetUserId) {
        io.to(targetUserId).emit(
          'message:new',
          socketResponse({
            message: `New message from ${opponent?.name}`,
            data: {
              ...message,
              is_sender: false,
              opponent,
            },
            meta: { chat_id },
          }),
        );
      }

      return {
        statusCode: StatusCodes.CREATED,
        message: 'Message sent successfully',
        data: message,
        meta: { chat_id },
      };
    }, MessageValidations.createMsg),
  );

  socket.on(
    'message:delete',
    catchAsyncSocket(async ({ message_id }) => {
      const message = await MessageServices.deleteMsg({
        message_id,
        user_id: user.id,
      });

      const chat = await prisma.chat.findUnique({
        where: { id: message.chat_id },
      });

      const targetUserId = isUser ? chat?.driver_id : chat?.user_id;
      if (targetUserId) {
        io.to(targetUserId).emit(
          'message:deleted',
          socketResponse({
            message: `Message deleted by ${user.name}`,
            data: message,
            meta: { chat_id: message.chat_id },
          }),
        );
      }

      return {
        message: 'Message deleted successfully',
        data: message,
        meta: { chat_id: message.chat_id },
      };
    }, MessageValidations.deleteMsg),
  );
};

export default ChatSocket;
