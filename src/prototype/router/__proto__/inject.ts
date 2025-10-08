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

Function.prototype.injectRoutes = function (routes) {
  Object.entries(routes).forEach(([path, middlewares]) =>
    (this as Router).use(path, ...middlewares),
  );

  return this as Router;
};

export {};
