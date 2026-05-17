import catchAsync from '../../middlewares/catchAsync';
import { IntercityServices } from './Intercity.service';

export const IntercityControllers = {
  createIntercity: catchAsync(async ({ body, user }) => {
    const intercity = await IntercityServices.createIntercity({
      ...body,
      driver_id: user.id,
    });

    return {
      message: 'Intercity ride created successfully!',
      data: intercity,
    };
  }),

  getDriverIntercities: catchAsync(async ({ query, user }) => {
    const { data, meta } = await IntercityServices.getDriverIntercities(
      user.id,
      parseInt(query.page as string) || 1,
      parseInt(query.limit as string) || 10,
    );

    return {
      message: 'Intercity rides retrieved successfully!',
      data,
      meta,
    };
  }),

  getIntercityDetails: catchAsync(async ({ params, user }) => {
    const intercity = await IntercityServices.getIntercityById(
      params.intercityId,
      user.id,
    );

    return {
      message: 'Intercity details retrieved successfully!',
      data: intercity,
    };
  }),

  updateIntercityStatus: catchAsync(async ({ params, body, user }) => {
    const intercity = await IntercityServices.updateIntercityStatus(
      params.intercityId,
      {
        ...body,
        driver_id: user.id,
      },
    );

    return {
      message: 'Intercity status updated successfully!',
      data: intercity,
    };
  }),

  handleJoinRequest: catchAsync(async ({ params, body, user }) => {
    const updated = await IntercityServices.handleJoinRequest(
      params.requestId,
      {
        ...body,
        driver_id: user.id,
      },
    );

    return {
      message: `Join request ${body.status.toLowerCase()} successfully!`,
      data: updated,
    };
  }),

  findNearby: catchAsync(async ({ query }) => {
    const { data, meta } = await IntercityServices.findNearbyIntercities({
      lat: parseFloat(query.lat as string),
      long: parseFloat(query.long as string),
      radius: parseFloat(query.radius as string) || 50,
      page: parseInt(query.page as string) || 1,
      limit: parseInt(query.limit as string) || 10,
    });

    return {
      message: 'Nearby intercity rides retrieved successfully!',
      data,
      meta,
    };
  }),
};
