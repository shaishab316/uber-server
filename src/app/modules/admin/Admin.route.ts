import { Router } from 'express';
import { UserRoutes } from '../user/User.route';
import { ContextPageRoutes } from '../contextPage/ContextPage.route';
import { DriverRoutes } from '../driver/Driver.route';
import { LogRoutes } from '../log/Log.route';

export default Router().inject([
  {
    path: '/users',
    route: UserRoutes.admin,
  },
  {
    path: '/drivers',
    route: DriverRoutes.admin,
  },
  {
    path: '/context-pages',
    route: ContextPageRoutes.admin,
  },
  {
    path: '/logs',
    route: LogRoutes,
  },
]);
