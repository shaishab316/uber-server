import { Router } from 'express';
import { NewsFeedControllers } from './NewsFeed.controller';
import { NewsFeedValidations } from './NewsFeed.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import capture from '../../middlewares/capture';
import auth from '../../middlewares/auth';

export const imageCapture = capture({
  image: {
    size: Infinity,
    maxCount: 1,
    fileType: 'images',
  },
});

const admin = Router();
{
  admin.post(
    '/',
    imageCapture,
    purifyRequest(NewsFeedValidations.create),
    NewsFeedControllers.create,
  );

  admin.patch(
    '/',
    imageCapture,
    purifyRequest(NewsFeedValidations.edit),
    NewsFeedControllers.edit,
  );

  admin.delete(
    '/',
    purifyRequest(NewsFeedValidations.delete),
    NewsFeedControllers.delete,
  );
}

const free = Router();
{
  free.get(
    '/',
    auth.all,
    purifyRequest(QueryValidations.list, NewsFeedValidations.getAllNews),
    NewsFeedControllers.getAllNews,
  );

  free.get(
    '/:news_id',
    purifyRequest(QueryValidations.exists('news_id', 'newsFeed')),
    NewsFeedControllers.getNewsById,
  );
}

export const NewsFeedRoutes = { admin, free };
