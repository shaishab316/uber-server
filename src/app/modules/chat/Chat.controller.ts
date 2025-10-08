import catchAsync from '../../middlewares/catchAsync';
import { ChatServices } from './Chat.service';
import { EUserRole } from '../../../../prisma';
import { ZodError } from 'zod';

export const ChatControllers = {
  getChat: catchAsync(async ({ query, user }) => {
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

    return {
      message: 'Chat retrieved successfully!',
      data,
    };
  }),

  getInboxChats: catchAsync(async ({ query, user }) => {
    if (user.role === EUserRole.USER) {
      query.user_id = user.id;
    } else {
      query.driver_id = user.id;
    }

    const { chats, meta } = await ChatServices.getInboxChats(query);

    return {
      message: 'Inbox chats retrieved successfully!',
      meta,
      data: chats,
    };
  }),

  deleteChat: catchAsync(async ({ params, user }) => {
    if (user.role === EUserRole.USER) {
      params.user_id = user.id;
    } else {
      params.driver_id = user.id;
    }

    await ChatServices.deleteChat(params);

    return {
      message: 'Chat deleted successfully!',
    };
  }),
};
