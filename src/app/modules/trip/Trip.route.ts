import { Router } from 'express';
import { TripControllers } from './Trip.controller';
import { TripValidations } from './Trip.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const user = Router();
{
  user.post(
    '/request-for-trip',
    purifyRequest(TripValidations.requestForTrip),
    TripControllers.requestForTrip,
  );
}

const driver = Router();
{
  driver.post(
    '/:tripId/accept-trip',
    purifyRequest(
      QueryValidations.exists('tripId', 'trip'),
      TripValidations.updateLocation,
    ),
    TripControllers.acceptTrip,
  );

  driver.post(
    '/:tripId/reject-trip',
    purifyRequest(
      QueryValidations.exists('tripId', 'trip'),
      TripValidations.reject,
    ),
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
