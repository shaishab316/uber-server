import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { LogServices } from './Log.service';

export const LogControllers = {
  info: catchAsync(async ({ query }, res) => {
    const { meta, logs } = await LogServices.getSuccessLogs(query);

    serveResponse(res, {
      message: 'Logs retrieved successfully!',
      meta,
      data: logs,
    });
  }),

  error: catchAsync(async ({ query }, res) => {
    const { meta, error_logs } = await LogServices.getErrorLogs(query);

    serveResponse(res, {
      message: 'Error logs retrieved successfully!',
      meta,
      data: error_logs,
    });
  }),

  clearLogs: catchAsync(async (_, res) => {
    const data = await LogServices.clearLogs();

    serveResponse(res, {
      message: 'Logs cleared successfully!',
      data,
    });
  }),

  clearErrorLogs: catchAsync(async (_, res) => {
    const data = await LogServices.clearErrorLogs();

    serveResponse(res, {
      message: 'Error logs cleared successfully!',
      data,
    });
  }),

  deleteLog: catchAsync(async ({ params }, res) => {
    const data = await LogServices.deleteLog(params.logId);

    serveResponse(res, {
      message: 'Log deleted successfully!',
      data,
    });
  }),

  deleteErrorLog: catchAsync(async ({ params }, res) => {
    const data = await LogServices.deleteErrorLog(params.errorLogId);

    serveResponse(res, {
      message: 'Error log deleted successfully!',
      data,
    });
  }),
};
