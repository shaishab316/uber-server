import { Router } from 'express';
import { TripControllers } from './Trip.controller';
import { TripValidations } from './Trip.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const user = Router();
{
  user.post(
    '/start',
    purifyRequest(TripValidations.start),
    TripControllers.start,
  );
}

const driver = Router();
{
  driver.post(
    '/:tripId/reject-trip',
    purifyRequest(QueryValidations.exists('tripId', 'trip')),
    TripControllers.rejectTrip,
  );

  driver.post(
    '/:tripId/update-location',
    purifyRequest(
      QueryValidations.exists('tripId', 'trip'),
      TripValidations.updateLocation,
    ),
    TripControllers.updateTripLocation,
  );
}

export const TripRoutes = { user, driver };
