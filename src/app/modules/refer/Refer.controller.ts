import serveResponse from '../../../utils/server/serveResponse';
import catchAsync from '../../middlewares/catchAsync';
import { ReferServices } from './Refer.service';

export const ReferControllers = {
  getReferredUsers: catchAsync(async ({ query }, res) => {
    const { meta, referredUsers } = await ReferServices.getReferredUsers(query);

    serveResponse(res, {
      message: 'Referred users fetched successfully',
      meta,
      data: referredUsers,
    });
  }),
};
