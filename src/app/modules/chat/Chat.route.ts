import { Router } from 'express';
import { ChatControllers } from './Chat.controller';
import { ChatValidations } from './Chat.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { MessageControllers } from '../message/Message.controller';

const user = Router();
{
  user.get(
    '/',
    purifyRequest(QueryValidations.list),
    ChatControllers.getInboxChats,
  );

  user.get(
    '/chat',
    purifyRequest(ChatValidations.getChat),
    ChatControllers.getChat,
  );

  user.get(
    '/:chatId/messages',
    purifyRequest(
      QueryValidations.exists('chatId', 'chat'),
      QueryValidations.list,
    ),
    MessageControllers.getChatMessages,
  );

  user.delete(
    '/:chatId/delete',
    purifyRequest(QueryValidations.exists('chatId', 'chat')),
    ChatControllers.deleteChat,
  );
}

export const ChatRoutes = { user };
