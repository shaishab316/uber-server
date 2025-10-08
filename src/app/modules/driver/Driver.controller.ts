import catchAsync from '../../middlewares/catchAsync';
import { DriverServices } from './Driver.service';

export const DriverControllers = {
  superGetPendingDrivers: catchAsync(async ({ query }) => {
    const { meta, users } = await DriverServices.superGetPendingDriver(query);

    return {
      message: 'Pending drivers retrieved successfully!',
      meta,
      data: users,
    };
  }),

  superApproveDriver: catchAsync(async ({ params }) => {
    const data = await DriverServices.superApproveDriver(params.driverId);

    return {
      message: 'Driver approved successfully!',
      data,
    };
  }),

  superRejectDriver: catchAsync(async ({ params }) => {
    const data = await DriverServices.superRejectDriver(params.driverId);

    return {
      message: 'Driver rejected successfully!',
      data,
    };
  }),
};
