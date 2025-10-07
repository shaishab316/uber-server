import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { DriverControllers } from './Driver.controller';
import { AvailableDriverRoutes } from '../availableDriver/AvailableDriver.route';
import { TripRoutes } from '../trip/Trip.route';
import { LoanRoutes } from '../loan/Loan.route';

const admin = Router();
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

// {
//   driver.use('/available-drivers', AvailableDriverRoutes.driver);
//   driver.use('/trips', TripRoutes.driver);
//   driver.use('/loans', LoanRoutes.driver);
// }
const driver = Router().injectRoutes([
  {
    path: '/available-drivers',
    route: AvailableDriverRoutes.driver,
  },
  {
    path: '/trips',
    route: TripRoutes.driver,
  },
  {
    path: '/loans',
    route: LoanRoutes.driver,
  },
]);

export const DriverRoutes = { admin, driver };
