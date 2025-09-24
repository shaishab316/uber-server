import { Router } from 'express';
import { MessageControllers } from './Message.controller';
import { MessageValidations } from './Message.validation';
import purifyRequest from '../../middlewares/purifyRequest';

const router = Router();

router.post(
  '/create',
  purifyRequest(MessageValidations.create),
  MessageControllers.create,
);

export const MessageRoutes = router;
