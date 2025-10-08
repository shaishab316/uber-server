import catchAsync from '../../middlewares/catchAsync';
import { ContextPageServices } from './ContextPage.service';
import { notFoundError } from '../../../errors';

export const ContextPageControllers = {
  modify: catchAsync(async ({ body }) => {
    const data = await ContextPageServices.modify(body);

    return {
      message: `${body.pageName} updated successfully!`,
      data,
    };
  }),

  getPageNames: catchAsync(async () => {
    const data = await ContextPageServices.getPageNames();

    return {
      message: 'Context Page retrieved successfully!',
      data: data.map(({ pageName }) => pageName),
    };
  }),

  getPage: catchAsync(async ({ params, originalUrl }) => {
    const data = await ContextPageServices.getPage(params.pageName);

    if (!data) throw notFoundError(originalUrl);

    return {
      message: `${params.pageName} retrieved successfully!`,
      data: data.content,
    };
  }),
};
