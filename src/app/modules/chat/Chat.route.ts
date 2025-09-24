import { Router } from 'express';
import { ChatControllers } from './Chat.controller';
import { ChatValidations } from './Chat.validation';
import purifyRequest from '../../middlewares/purifyRequest';

const router = Router();

router.post(
  '/create',
  purifyRequest(ChatValidations.create),
  ChatControllers.create,
);

export const ChatRoutes = router;
