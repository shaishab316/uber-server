/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import serveResponse, {
  TServeResponse,
} from '../../utils/server/serveResponse';
import { UserActivityServices } from '../modules/userActivity/UserActivity.service';

/**
 * Type for request body and query
 */
export type ReqProps = {
  body?: any;
  query?: any;
  params?: any;
};

/**
 * AsyncHandler type
 * Wraps an Express request handler with typed request body and query
 */
export type AsyncHandler<T extends ReqProps = ReqProps> = (
  req: Request<T['params'], any, T['body'], T['query']>,
  res: Response,
  next: NextFunction,
) =>
  | void
  | Partial<TServeResponse<any>>
  | Promise<void | Partial<TServeResponse<any>>>;

/**
 * Wraps an Express request handler to catch and handle async errors
 *
 * @param fn - The Express request handler function to wrap
 * @returns A wrapped request handler that catches async errors
 */
const catchAsync =
  <T extends ReqProps = ReqProps>(fn: AsyncHandler<T>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fn(
        req as Request<T['params'], any, T['body'], T['query']> & {
          params: T['params'];
        },
        res,
        next,
      );

      //? Log user activity if track_activity is set
      if (result?.track_activity) {
        await UserActivityServices.createActivity({
          user_id: result.track_activity,
          path: req.originalUrl,
          content: result.message ?? 'Unavailable',
        });
      }

      if (result) serveResponse(res, result);
    } catch (error) {
      next(error);
    }
  };

export default catchAsync;
