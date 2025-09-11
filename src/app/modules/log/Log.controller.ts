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

  infoPage: catchAsync(async (_, res) => {
    res.sendFile(__dirname + '/views/log.html');
  }),

  errorPage: catchAsync(async (_, res) => {
    res.sendFile(__dirname + '/views/error_log.html');
  }),
};
