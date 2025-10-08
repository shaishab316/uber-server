import catchAsync from '../../middlewares/catchAsync';
import { MessageServices } from './Message.service';

export const MessageControllers = {
  getChatMessages: catchAsync(async ({ query, params }) => {
    const { meta, messages } = await MessageServices.getChatMessages({
      ...query,
      chat_id: params.chatId,
    });

    return {
      message: 'Chat messages retrieved successfully!',
      meta,
      data: messages,
    };
  }),
};
