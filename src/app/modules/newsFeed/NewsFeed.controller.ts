import { StatusCodes } from 'http-status-codes';
import serveResponse from '../../../utils/server/serveResponse';
import catchAsync from '../../middlewares/catchAsync';
import { NewsFeedServices } from './NewsFeed.service';

export const NewsFeedControllers = {
  create: catchAsync(async ({ body }, res) => {
    const data = await NewsFeedServices.createNewsFeed(body);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'NewsFeed created successfully!',
      data,
    });
  }),

  edit: catchAsync(async ({ body }, res) => {
    const data = await NewsFeedServices.editNewsFeed(body);

    serveResponse(res, {
      message: 'NewsFeed edited successfully!',
      data,
    });
  }),

  delete: catchAsync(async ({ body }, res) => {
    await NewsFeedServices.deleteNewsFeed(body);

    serveResponse(res, {
      message: 'NewsFeed deleted successfully!',
    });
  }),

  getAllNews: catchAsync(async ({ query, user }, res) => {
    const { meta, newsFeeds } = await NewsFeedServices.getAllNews({
      ...query,
      role: user.role,
    });

    serveResponse(res, {
      message: 'NewsFeeds fetched successfully!',
      meta,
      data: newsFeeds,
    });
  }),

  getNewsById: catchAsync(async ({ params }, res) => {
    const data = await NewsFeedServices.getNewsById(params.news_id);

    serveResponse(res, {
      message: 'News fetched successfully!',
      data,
    });
  }),
};
