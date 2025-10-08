import { Router } from 'express';
import { TripControllers } from './Trip.controller';
import { TripValidations } from './Trip.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const user = Router();
{
  user.get(
    '/',
    purifyRequest(QueryValidations.list, TripValidations.getTripHistory),
    TripControllers.getTripHistory,
  );

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
      TripValidations.acceptTrip,
    ),
    TripControllers.acceptTrip,
  );

  driver.post(
    '/:tripId/start-trip',
    purifyRequest(
      QueryValidations.exists('tripId', 'trip'),
      TripValidations.startTrip,
    ),
    TripControllers.startTrip,
  );

  driver.post(
    '/:tripId/reject-trip',
    purifyRequest(
      QueryValidations.exists('tripId', 'trip'),
      TripValidations.rejectTrip,
    ),
    TripControllers.rejectTrip,
  );

  driver.post(
    '/:tripId/complete-trip',
    purifyRequest(
      QueryValidations.exists('tripId', 'trip'),
      TripValidations.completeTrip,
    ),
    TripControllers.completeTrip,
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

const admin = Router();
{
  admin.get(
    '/',
    purifyRequest(QueryValidations.list, TripValidations.getTripHistory),
    TripControllers.superGetTripHistory,
  );
}

export const TripRoutes = { user, driver, admin };
