import serveResponse from '../../../utils/server/serveResponse';
import catchAsync from '../../middlewares/catchAsync';
import { AdminServices } from './Admin.service';

export const AdminControllers = {
  overview: catchAsync(async ({ query }, res) => {
    const data = await AdminServices.overview(query);

    serveResponse(res, {
      message: 'Admin overview fetched successfully',
      data,
    });
  }),
};
