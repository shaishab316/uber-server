import { Router } from 'express';
import auth from '../app/middlewares/auth';
import AdminRoutes from '../app/modules/admin/Admin.route';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { UserRoutes } from '../app/modules/user/User.route';
import { ContextPageRoutes } from '../app/modules/contextPage/ContextPage.route';
import { DriverRoutes } from '../app/modules/driver/Driver.route';
import { TripRoutes } from '../app/modules/trip/Trip.route';
import { ChatRoutes } from '../app/modules/chat/Chat.route';
import { PaymentRoutes } from '../app/modules/payment/Payment.route';
import { TransactionRoutes } from '../app/modules/transaction/Transaction.route';
import { injectRoutes } from '../utils/router/injectRouter';
import { NewsFeedRoutes } from '../app/modules/newsFeed/NewsFeed.route';
import { NotificationRoutes } from '../app/modules/notification/Notification.route';
import { ReferRoutes } from '../app/modules/refer/Refer.route';
import { AvailableLoanRoutes } from '../app/modules/availableLoan/AvailableLoan.route';
import { AzulRoutes } from '../app/modules/azul/Azul.route';
import { TopupRoutes } from '../app/modules/topup/Topup.route';

export default injectRoutes(Router(), {
  '/context-pages': [ContextPageRoutes.user],

  // No auth
  '/auth': [AuthRoutes],
  '/payments': [PaymentRoutes.user],
  '/news-feeds': [NewsFeedRoutes.free],
  '/azul': [AzulRoutes],
  '/topup': [TopupRoutes],

  // Free auth
  '/profile': [auth.all, UserRoutes.user],
  '/transactions': [auth.all, TransactionRoutes.user],
  '/chats': [auth.all, ChatRoutes.user],
  '/trips': [auth.all, TripRoutes.user],
  '/notifications': [auth.all, NotificationRoutes.all],
  '/refers': [auth.all, ReferRoutes.all],
  '/available-loans': [auth.all, AvailableLoanRoutes.all],

  // Driver auth
  '/drivers': [auth.driver, DriverRoutes.driver],

  // Admin auth
  '/admin': [auth.admin, AdminRoutes],
});
