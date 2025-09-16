import { Router } from 'express';
import { CancelTripControllers } from './CancelTrip.controller';
import { CancelTripValidations } from './CancelTrip.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const admin = Router();
{
  admin.get(
    '/',
    purifyRequest(
      QueryValidations.list,
      CancelTripValidations.getAllCancelTrip,
    ),
    CancelTripControllers.getAllCancelTrip,
  );
}

export const CancelTripRoutes = { admin };
