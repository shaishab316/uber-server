import { Router } from 'express';
import { LogControllers } from './Log.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { LogValidations } from './Log.validation';

const router = Router();

router.get(
  '/info',
  purifyRequest(QueryValidations.list, LogValidations.log),
  LogControllers.info,
);
router.get(
  '/error',
  purifyRequest(QueryValidations.list, LogValidations.log),
  LogControllers.error,
);

export const LogRoutes = router;
