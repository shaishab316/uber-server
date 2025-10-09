/* eslint-disable no-unused-vars */
import { Router } from 'express';
import { TRoutes } from '../../../types/route.types';

declare global {
  interface Function {
    /**
     * Injects routes into the router
     *
     * @param {TRoutes} routes - object with path as key and array of middlewares as value
     * @returns {Router} - router with injected routes
     */
    injectRoutes(routes: TRoutes): Router;
  }
}

function injectRoutes(router: Router, routes: TRoutes) {
  Object.entries(routes).forEach(([path, middlewares]) =>
    router.use(path, ...middlewares),
  );

  return router;
}

Function.prototype.injectRoutes = function (routes) {
  return injectRoutes(this as Router, routes);
};

export { injectRoutes };
