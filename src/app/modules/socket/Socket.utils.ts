/* eslint-disable no-unused-vars */
import z, { ZodType } from 'zod';
import { TServeResponse } from '../../../utils/server/serveResponse';
import { StatusCodes } from 'http-status-codes';
import { formatError } from '../../middlewares/globalErrorHandler';
import chalk from 'chalk';
import { errorLogger } from '../../../utils/logger';

export const catchAsyncSocket = <S extends ZodType>(
  fn: (data: z.infer<S>) => Promise<Partial<TServeResponse<any>>>,
  validator: S,
) => {
  return async (
    payload: unknown,
    ack?: (response: any) => void,
  ): Promise<void> => {
    const response: any = { success: false };
    try {
      const unsafe =
        typeof payload === 'string' ? JSON.parse(payload) : payload;

      console.log(`unsafe socket body: %o`, unsafe);
      const parsed = await validator.parseAsync(unsafe);

      Object.assign(response, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Success',
        ...(await fn(parsed)),
      });
    } catch (error: any) {
      console.error(error);
      Object.assign(response, formatError(error));
      errorLogger.error(chalk.red(response.message));
    } finally {
      ack?.(JSON.stringify(response));
    }
  };
};

export const socketResponse = <T>(
  response: Partial<TServeResponse<T>>,
): string =>
  JSON.stringify({
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Success',
    ...response,
  } as TServeResponse<T>);
