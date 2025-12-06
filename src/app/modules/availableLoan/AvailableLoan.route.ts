import { Router } from 'express';
import { AvailableLoanControllers } from './AvailableLoan.controller';
import { AvailableLoanValidations } from './AvailableLoan.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { imageCapture } from '../newsFeed/NewsFeed.route';
import { QueryValidations } from '../query/Query.validation';

const admin = Router();
{
  admin.post(
    '/',
    imageCapture,
    purifyRequest(AvailableLoanValidations.create),
    AvailableLoanControllers.create,
  );

  admin.patch(
    '/',
    imageCapture,
    purifyRequest(AvailableLoanValidations.update),
    AvailableLoanControllers.update,
  );

  admin.delete(
    '/',
    purifyRequest(AvailableLoanValidations.delete),
    AvailableLoanControllers.delete,
  );
}

const driver = Router();
{
  driver.get(
    '/',
    purifyRequest(QueryValidations.list),
    AvailableLoanControllers.getAllLoans,
  );

  driver.get(
    '/:load_id',
    purifyRequest(QueryValidations.exists('load_id', 'availableLoan')),
    AvailableLoanControllers.getLoanById,
  );
}

export const AvailableLoanRoutes = { admin, driver };
