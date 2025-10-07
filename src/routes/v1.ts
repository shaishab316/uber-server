import { Router } from 'express';
import auth from '../app/middlewares/auth';
import AdminRoutes from '../app/modules/admin/Admin.route';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { UserRoutes } from '../app/modules/user/User.route';
import { StatusCodes } from 'http-status-codes';
import { ContextPageRoutes } from '../app/modules/contextPage/ContextPage.route';
import { fileTypes } from '../app/middlewares/capture';
import { DriverRoutes } from '../app/modules/driver/Driver.route';
import { TripRoutes } from '../app/modules/trip/Trip.route';
import { ChatRoutes } from '../app/modules/chat/Chat.route';

const appRouter = Router();

/** Forward uploaded files requests */
fileTypes.map((filetype: string) =>
  appRouter.get(`/${filetype}/:filename`, (req, res) =>
    res.redirect(
      StatusCodes.MOVED_PERMANENTLY,
      `/${filetype}/${encodeURIComponent(req.params.filename)}`,
    ),
  ),
);

export default appRouter.injectRoutes({
  '/context-pages': [ContextPageRoutes.user],

  '/auth': [AuthRoutes],
  '/profile': [auth.all, UserRoutes.user],
  '/chats': [auth.all, ChatRoutes.user],
  '/trips': [auth.user, TripRoutes.user],
  '/drivers': [auth.driver, DriverRoutes.driver],
  '/admin': [auth.admin, AdminRoutes],
});
