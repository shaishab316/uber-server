import { Router } from 'express';
import { UserRoutes } from '../user/User.route';
import { ContextPageRoutes } from '../contextPage/ContextPage.route';
import { DriverRoutes } from '../driver/Driver.route';
import { LogRoutes } from '../log/Log.route';
import { CancelTripRoutes } from '../cancelTrip/CancelTrip.route';
import { TripRoutes } from '../trip/Trip.route';

export default Router().injectRoutes({
  '/users': [UserRoutes.admin],
  '/drivers': [DriverRoutes.admin],
  '/context-pages': [ContextPageRoutes.admin],
  '/logs': [LogRoutes],
  '/trips': [TripRoutes.admin],
  '/cancel-trips': [CancelTripRoutes.admin],
});
