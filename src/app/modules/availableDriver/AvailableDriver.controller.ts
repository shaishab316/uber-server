import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { AvailableDriverServices } from './AvailableDriver.service';

export const AvailableDriverControllers = {
  join: catchAsync(async ({ body, user }, res) => {
    await AvailableDriverServices.join({
      driver_id: user.id,
      ...body,
    });

    serveResponse(res, {
      message: 'Driver joined successfully!',
    });
  }),

  leave: catchAsync(async ({ user }, res) => {
    try {
      await AvailableDriverServices.leave({
        driver_id: user.id,
      });
    } finally {
      serveResponse(res, {
        message: 'Driver left successfully!',
      });
    }
  }),
};
