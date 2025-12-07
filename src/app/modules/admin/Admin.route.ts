import { Router } from 'express';
import { UserRoutes } from '../user/User.route';
import { ContextPageRoutes } from '../contextPage/ContextPage.route';
import { DriverRoutes } from '../driver/Driver.route';
import { CancelTripRoutes } from '../cancelTrip/CancelTrip.route';
import { TripRoutes } from '../trip/Trip.route';
import { injectRoutes } from '../../../utils/router/injectRouter';
import { TransactionRoutes } from '../transaction/Transaction.route';
import { NewsFeedRoutes } from '../newsFeed/NewsFeed.route';
import { AvailableLoanRoutes } from '../availableLoan/AvailableLoan.route';
import { UserActivityRoutes } from '../userActivity/UserActivity.route';
import purifyRequest from '../../middlewares/purifyRequest';
import { AdminValidations } from './Admin.validation';
import { AdminControllers } from './Admin.controller';

const adminRoutes = injectRoutes(Router(), {
  '/users': [UserRoutes.admin],
  '/drivers': [DriverRoutes.admin],
  '/context-pages': [ContextPageRoutes.admin],
  '/trips': [TripRoutes.admin],
  '/cancel-trips': [CancelTripRoutes.admin],
  '/transactions': [TransactionRoutes.admin],
  '/news-feeds': [NewsFeedRoutes.admin],
  '/loans': [AvailableLoanRoutes.admin],
  '/user-activities': [UserActivityRoutes.admin],
});

adminRoutes.get(
  '/overview',
  purifyRequest(AdminValidations.overview),
  AdminControllers.overview,
);

export default adminRoutes;
