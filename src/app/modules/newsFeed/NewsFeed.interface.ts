import z from 'zod';
import { NewsFeedValidations } from './NewsFeed.validation';
import { TList } from '../query/Query.interface';

export type TNewsCreate = z.infer<typeof NewsFeedValidations.create>['body'];

export type TNewsEdit = z.infer<typeof NewsFeedValidations.edit>['body'];

export type TNewsDelete = z.infer<typeof NewsFeedValidations.delete>['body'];

export type TNewsGetAll = z.infer<
  typeof NewsFeedValidations.getAllNews
>['query'] &
  TList;
