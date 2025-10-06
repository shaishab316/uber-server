import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../utils/server/serveResponse';
import { MessageServices } from './Message.service';

export const MessageControllers = {
  getChatMessages: catchAsync(async ({ query, params }, res) => {
    const { meta, messages } = await MessageServices.getChatMessages({
      ...query,
      chat_id: params.chatId,
    });

    serveResponse(res, {
      message: 'Chat messages retrieved successfully!',
      meta,
      data: messages,
    });
  }),
};
