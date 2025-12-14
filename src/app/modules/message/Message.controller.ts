import { EUserRole } from '../../../../prisma';
import catchAsync from '../../middlewares/catchAsync';
import { MessageServices } from './Message.service';

export const MessageControllers = {
  getChatMessages: catchAsync(async ({ query, params, user }) => {
    const { meta, messages } = await MessageServices.getChatMessages({
      ...query,
      chat_id: params.chatId,
    });

    return {
      message: 'Chat messages retrieved successfully!',
      meta,
      data: messages.map(message => ({
        ...message,
        is_sender:
          user.role === EUserRole.DRIVER
            ? message.driver_id === user.id
            : message.user_id === user.id,
      })),
    };
  }),
};
