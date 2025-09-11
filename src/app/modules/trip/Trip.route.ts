import { Router } from 'express';
import { TripControllers } from './Trip.controller';
import { TripValidations } from './Trip.validation';
import purifyRequest from '../../middlewares/purifyRequest';

const user = Router();

{
  user.post(
    '/start',
    purifyRequest(TripValidations.start),
    TripControllers.start,
  );
}

export const TripRoutes = { user };
