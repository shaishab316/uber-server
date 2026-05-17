import { Router } from 'express';
import { IntercityControllers } from './Intercity.controller';
import { IntercityValidations } from './Intercity.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const driver = Router();

// Create intercity ride
driver.post(
  '/',
  purifyRequest(IntercityValidations.createIntercity),
  IntercityControllers.createIntercity,
);

// Find nearby intercity rides
driver.get(
  '/search/nearby',
  purifyRequest(IntercityValidations.findNearby, QueryValidations.list),
  IntercityControllers.findNearby,
);

// Get all driver's intercity rides
driver.get(
  '/my',
  purifyRequest(QueryValidations.list),
  IntercityControllers.getDriverIntercities,
);

// Get specific intercity details
driver.get(
  '/:intercityId',
  purifyRequest(QueryValidations.exists('intercityId', 'intercity')),
  IntercityControllers.getIntercityDetails,
);

// Update intercity status
driver.post(
  '/:intercityId/status',
  purifyRequest(
    IntercityValidations.updateIntercityStatus,
    QueryValidations.exists('intercityId', 'intercity'),
  ),
  IntercityControllers.updateIntercityStatus,
);

// Accept/Reject join request
driver.post(
  '/:intercityId/join-requests/:requestId',
  purifyRequest(
    IntercityValidations.handleJoinRequest,
    QueryValidations.exists('intercityId', 'intercity'),
    QueryValidations.exists('requestId', 'intercityJoinRequest'),
  ),
  IntercityControllers.handleJoinRequest,
);

export { driver as driverIntercityRoutes };
