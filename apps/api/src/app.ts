import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import { env } from './config/env';
import { defaultLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.router';
import { userRouter } from './modules/user/user.router';
import { integrationsRouter } from './modules/integrations/integrations.router';
import { rssRouter } from './modules/rss/rss.router';
import { summariesRouter } from './modules/summaries/summaries.router';
import { analyticsRouter } from './modules/analytics/analytics.router';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(pinoHttp({ logger }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(defaultLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/integrations', integrationsRouter);
  app.use('/api/rss', rssRouter);
  app.use('/api/summaries', summariesRouter);
  app.use('/api/analytics', analyticsRouter);

  app.use(errorHandler);

  return app;
}
