import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/notFound.middleware';
import { globalRateLimit } from './middleware/rateLimit.middleware';
import { sendSuccess } from './utils/ApiResponse';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (env.corsOrigins.length === 0 || env.corsOrigins.includes(origin)) {
          return cb(null, true);
        }
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger }));
  app.use(globalRateLimit);

  app.get('/health', (_req, res) => sendSuccess(res, { status: 'ok' }));

  app.use('/api/v1', routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}