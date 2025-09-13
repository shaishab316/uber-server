import { Router } from 'express';
import { LogControllers } from './Log.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { LogValidations } from './Log.validation';

const router = Router();
{
  router.get(
    '/info',
    purifyRequest(QueryValidations.list, LogValidations.log),
    LogControllers.info,
  );

  router.delete('/info/clear', LogControllers.clearLogs);

  router.delete(
    '/info/:logId/delete',
    purifyRequest(QueryValidations.exists('logId', 'log')),
    LogControllers.deleteLog,
  );
}

{
  router.get(
    '/error',
    purifyRequest(QueryValidations.list, LogValidations.log),
    LogControllers.error,
  );

  router.delete('/error/clear', LogControllers.clearErrorLogs);

  router.delete(
    '/error/:errorLogId/delete',
    purifyRequest(QueryValidations.exists('errorLogId', 'errorLog')),
    LogControllers.deleteErrorLog,
  );
}

export const LogRoutes = router;
