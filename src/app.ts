import cors from 'cors';
import express from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import RoutesV1 from './routes/v1';
import { Morgan } from './utils/logger/morgen';
import cookieParser from 'cookie-parser';
import config from './config';
import { notFoundError } from './errors';
import { fileRetriever, fileTypes } from './app/middlewares/capture';
import serveResponse from './utils/server/serveResponse';

/**
 * The main application instance
 *
 * This is the main application instance that sets up the Express server.
 * It configures middleware, routes, and error handling.
 */
const app = express();

// Serve static files
app.use(express.static('public'));
fileTypes.forEach(type => app.get(`/${type}/:filename`, fileRetriever));

// Configure middleware
app.use(
  cors({
    origin: config.server.allowed_origins,
    credentials: true,
  }),

  Morgan.successHandler,
  Morgan.errorHandler,

  (req, res, next) =>
    (req.headers['stripe-signature']
      ? express.raw({ type: 'application/json' })
      : express.json())(req, res, next),

  express.text(),
  express.urlencoded({ extended: true }),
  cookieParser(),
);

app.get('/', ({ headers }, res) => {
  res.redirect(
    headers['accept']?.includes('text/html') ? '/pages/index.html' : '/health',
  );
});

// Health check
app.get('/health', (_, res) => {
  serveResponse(res, {
    message: 'Server is healthy!',
    meta: {
      timestamp: new Date(),
      version: process.env.npm_package_version,
      env: process.env.NODE_ENV,
    },
  });
});

// API routes
app.use('/api/v1', RoutesV1);

// 404 handler
app.use(({ originalUrl, headers }, res, next) => {
  //! if browser is requesting show 404 page
  if (headers['accept']?.includes('text/html'))
    return res.redirect('/pages/404.html');

  next(notFoundError(originalUrl));
});

// Error handler
app.use(globalErrorHandler);

export default app;
