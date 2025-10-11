import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { DriverControllers } from './Driver.controller';
import { AvailableDriverRoutes } from '../availableDriver/AvailableDriver.route';
import { TripRoutes } from '../trip/Trip.route';
import { LoanRoutes } from '../loan/Loan.route';
import { injectRoutes } from '../../../utils/router/injectRouter';

const admin = injectRoutes(Router(), {
  '/loans': [LoanRoutes.admin],
});
{
  admin.get(
    '/pending',
    purifyRequest(QueryValidations.list),
    DriverControllers.superGetPendingDrivers,
  );

  admin.post(
    '/:driverId/approve',
    purifyRequest(QueryValidations.exists('driverId', 'user')),
    DriverControllers.superApproveDriver,
  );

  admin.post(
    '/:driverId/reject',
    purifyRequest(QueryValidations.exists('driverId', 'user')),
    DriverControllers.superRejectDriver,
  );
}

const driver = injectRoutes(Router(), {
  '/available-drivers': [AvailableDriverRoutes.driver],
  '/trips': [TripRoutes.driver],
  '/loans': [LoanRoutes.driver],
});

export const DriverRoutes = { admin, driver };
