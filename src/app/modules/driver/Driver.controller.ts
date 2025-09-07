import serveResponse from '../../../util/server/serveResponse';
import catchAsync from '../../middlewares/catchAsync';
import { DriverServices } from './Driver.service';

export const DriverControllers = {
  superGetPendingDrivers: catchAsync(async ({ query }, res) => {
    const { meta, users } = await DriverServices.superGetPendingDriver(query);

    serveResponse(res, {
      message: 'Pending drivers retrieved successfully!',
      meta,
      data: users,
    });
  }),

  superApproveDriver: catchAsync(async ({ params }, res) => {
    const data = await DriverServices.superApproveDriver(params.driverId);

    serveResponse(res, {
      message: 'Driver approved successfully!',
      data,
    });
  }),

  superRejectDriver: catchAsync(async ({ params }, res) => {
    const data = await DriverServices.superRejectDriver(params.driverId);

    serveResponse(res, {
      message: 'Driver rejected successfully!',
      data,
    });
  }),
};
