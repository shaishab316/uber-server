import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { TripServices } from './Trip.service';

export const TripControllers = {
  start: catchAsync(async ({ body, user }, res) => {
    await TripServices.start({ ...body, passenger_id: user.id });

    serveResponse(res, {
      message: 'Trip started successfully!',
    });
  }),
};
