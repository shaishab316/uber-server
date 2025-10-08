import catchAsync from '../../middlewares/catchAsync';
import { LogServices } from './Log.service';

export const LogControllers = {
  info: catchAsync(async ({ query }) => {
    const { meta, logs } = await LogServices.getSuccessLogs(query);

    return {
      message: 'Logs retrieved successfully!',
      meta,
      data: logs,
    };
  }),

  error: catchAsync(async ({ query }) => {
    const { meta, error_logs } = await LogServices.getErrorLogs(query);

    return {
      message: 'Error logs retrieved successfully!',
      meta,
      data: error_logs,
    };
  }),

  clearLogs: catchAsync(async () => {
    const data = await LogServices.clearLogs();

    return {
      message: 'Logs cleared successfully!',
      data,
    };
  }),

  clearErrorLogs: catchAsync(async () => {
    const data = await LogServices.clearErrorLogs();

    return {
      message: 'Error logs cleared successfully!',
      data,
    };
  }),

  deleteLog: catchAsync(async ({ params }) => {
    const data = await LogServices.deleteLog(params.logId);

    return {
      message: 'Log deleted successfully!',
      data,
    };
  }),

  deleteErrorLog: catchAsync(async ({ params }) => {
    const data = await LogServices.deleteErrorLog(params.errorLogId);

    return {
      message: 'Error log deleted successfully!',
      data,
    };
  }),
};
