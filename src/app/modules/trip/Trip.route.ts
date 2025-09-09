import { Router } from 'express';
import { TripControllers } from './Trip.controller';
import { TripValidations } from './Trip.validation';
import purifyRequest from '../../middlewares/purifyRequest';

const router = Router();

router.post(
  '/create',
  purifyRequest(TripValidations.create),
  TripControllers.create,
);

export const TripRoutes = router;
