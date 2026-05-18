import { Router } from 'express';
import { IntercityControllers } from './Intercity.controller';
import { IntercityValidations } from './Intercity.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import auth from '../../middlewares/auth';

const driver = Router();

// Create intercity ride
driver.post(
  '/',
  auth.driver,
  purifyRequest(IntercityValidations.createIntercity),
  IntercityControllers.createIntercity,
);

// Find nearby intercity rides
driver.get(
  '/search/nearby',
  auth.all,
  purifyRequest(IntercityValidations.findNearby, QueryValidations.list),
  IntercityControllers.findNearby,
);

// Get all driver's intercity rides
driver.get(
  '/my',
  auth.all,
  purifyRequest(QueryValidations.list),
  IntercityControllers.getDriverIntercities,
);

// Get specific intercity details
driver.get(
  '/:intercityId',
  auth.all,
  purifyRequest(QueryValidations.exists('intercityId', 'intercity')),
  IntercityControllers.getIntercityDetails,
);

// Update intercity status
driver.post(
  '/:intercityId/status',
  auth.driver,
  purifyRequest(
    IntercityValidations.updateIntercityStatus,
    QueryValidations.exists('intercityId', 'intercity'),
  ),
  IntercityControllers.updateIntercityStatus,
);

// Send join request to intercity
driver.post(
  '/:intercityId/join',
  auth.user,
  purifyRequest(
    IntercityValidations.sendJoinRequest,
    QueryValidations.exists('intercityId', 'intercity'),
  ),
  IntercityControllers.sendJoinRequest,
);

// Get join requests for intercity
driver.get(
  '/:intercityId/requests',
  auth.driver,
  purifyRequest(
    QueryValidations.exists('intercityId', 'intercity'),
    QueryValidations.list,
  ),
  IntercityControllers.getJoinRequests,
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
