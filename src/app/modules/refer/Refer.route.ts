import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { ReferControllers } from './Refer.controller';

const all = Router();
{
  all.get(
    '/',
    purifyRequest(QueryValidations.list),
    ReferControllers.getReferredUsers,
  );
}

export const ReferRoutes = { all };
