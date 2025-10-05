/* eslint-disable no-unused-vars */
import { ErrorRequestHandler, RequestHandler } from 'express';
import z, { ZodType } from 'zod';
import { formatError } from './globalErrorHandler';
import { errorLogger } from '../../util/logger/logger';
import chalk from 'chalk';
import { StatusCodes } from 'http-status-codes';
import { TServeResponse } from '../../util/server/serveResponse';

/**
 * Wraps an Express request handler to catch and handle async errors
 *
 * @param fn - The Express request handler function to wrap
 * @returns A wrapped request handler that catches async errors
 */
const catchAsync =
  (
    fn: RequestHandler<any, any, any, any>,
    errFn: ErrorRequestHandler | null = null,
  ): RequestHandler =>
  async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (errFn) await errFn(error, req, res, next);
      else next(error);
    }
  };

catchAsync.socket = <S extends ZodType>(
  fn: (data: z.infer<S>) => Promise<Partial<TServeResponse<any>>>,
  validator: S,
) => {
  return async (
    payload: unknown,
    ack?: (response: any) => void,
  ): Promise<void> => {
    const response: any = {};
    try {
      const parsed = await validator.parseAsync(
        typeof payload === 'string' ? JSON.parse(payload) : payload,
      );

      Object.assign(response, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Success',
        ...(await fn(parsed)),
      });
    } catch (error: any) {
      Object.assign(response, formatError(error));
      errorLogger.error(chalk.red(response.message));
    } finally {
      ack?.(JSON.stringify(response));
    }
  };
};

export default catchAsync;
