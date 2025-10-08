import catchAsync from '../../middlewares/catchAsync';
import { AvailableDriverServices } from './AvailableDriver.service';

export const AvailableDriverControllers = {
  join: catchAsync(async ({ body, user }) => {
    await AvailableDriverServices.join({
      ...body,
      driver_id: user.id,
    });

    return {
      message: 'Driver joined successfully!',
    };
  }),

  leave: catchAsync(async ({ user }) => {
    try {
      await AvailableDriverServices.leave({
        driver_id: user.id,
      });
    } catch {
      void 0;
    }

    return {
      message: 'Driver left successfully!',
    };
  }),
};
