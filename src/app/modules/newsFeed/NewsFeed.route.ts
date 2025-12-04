import { Router } from 'express';
import { NewsFeedControllers } from './NewsFeed.controller';
import { NewsFeedValidations } from './NewsFeed.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const admin = Router();
{
  admin.post(
    '/',
    purifyRequest(NewsFeedValidations.create),
    NewsFeedControllers.create,
  );

  admin.patch(
    '/',
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
    purifyRequest(QueryValidations.list),
    NewsFeedControllers.getAllNews,
  );

  free.get(
    '/:news_id',
    purifyRequest(QueryValidations.exists('news_id', 'newsFeed')),
    NewsFeedControllers.getNewsById,
  );
}

export const NewsFeedRoutes = { admin, free };
