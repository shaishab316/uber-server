import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
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
};

/*

 const issues: $ZodIssue[] = [];

      if (!email && !phone)
        issues.push({
          code: 'custom',
          path: ['email'],
          message: 'Email or phone is missing',
        });

      if (!phone && !email)
        issues.push({
          code: 'custom',
          path: ['phone'],
          message: 'Email or phone is missing',
        });

      if (issues.length) throw new ZodError(issues);


      */
