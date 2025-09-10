import { Router } from 'express';
import { AvailableDriverControllers } from './AvailableDriver.controller';
import { AvailableDriverValidations } from './AvailableDriver.validation';
import purifyRequest from '../../middlewares/purifyRequest';

const driver = Router();
{
  driver.post(
    '/join',
    purifyRequest(AvailableDriverValidations.join),
    AvailableDriverControllers.join,
  );

  driver.all('/leave', AvailableDriverControllers.leave);
}

export const AvailableDriverRoutes = { driver };
