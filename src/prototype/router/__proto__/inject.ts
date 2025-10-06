/* eslint-disable no-unused-vars */
import { Router } from 'express';
import { TRoute } from '../../../types/route.types';

declare global {
  interface Function {
    injectRoutes(routes: TRoute[]): Router;
  }
}

Function.prototype.injectRoutes = function (routes: TRoute[]) {
  routes.forEach(({ path, middlewares = [], route }) =>
    (this as Router).use(path, ...middlewares, route),
  );

  return this as Router;
};

export {};
