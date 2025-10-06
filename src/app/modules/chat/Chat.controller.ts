import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../utils/server/serveResponse';
import { ChatServices } from './Chat.service';
import { EUserRole } from '../../../../prisma';
import { ZodError } from 'zod';

export const ChatControllers = {
  getChat: catchAsync(async ({ query, user }, res) => {
    if (user.role === EUserRole.USER) {
      query.user_id = user.id;
      if (!query.driver_id)
        throw new ZodError([
          {
            code: 'custom',
            path: ['driver_id'],
            message: 'Driver id is missing',
          },
        ]);
    } else {
      query.driver_id = user.id;
      if (!query.user_id)
        throw new ZodError([
          {
            code: 'custom',
            path: ['user_id'],
            message: 'User id is missing',
          },
        ]);
    }

    const data = await ChatServices.getChat(query);

    serveResponse(res, {
      message: 'Chat retrieved successfully!',
      data,
    });
  }),

  getInboxChats: catchAsync(async ({ query, user }, res) => {
    if (user.role === EUserRole.USER) {
      query.user_id = user.id;
    } else {
      query.driver_id = user.id;
    }

    const { chats, meta } = await ChatServices.getInboxChats(query);

    serveResponse(res, {
      message: 'Inbox chats retrieved successfully!',
      meta,
      data: chats,
    });
  }),

  deleteChat: catchAsync(async ({ params, user }, res) => {
    if (user.role === EUserRole.USER) {
      params.user_id = user.id;
    } else {
      params.driver_id = user.id;
    }

    await ChatServices.deleteChat(params);

    serveResponse(res, {
      message: 'Chat deleted successfully!',
    });
  }),
};
