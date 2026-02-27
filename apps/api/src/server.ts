import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { startDailySummaryWorker } from './jobs/workers/dailySummary.worker';
import { startWeeklySummaryWorker } from './jobs/workers/weeklySummary.worker';
import { startRssFetchWorker } from './jobs/workers/rssFetch.worker';
import { startScheduler } from './jobs/scheduler';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
});

startDailySummaryWorker();
startWeeklySummaryWorker();
startRssFetchWorker();

startScheduler().catch((err) => {
  logger.error({ err }, 'Failed to start scheduler');
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

export default app;
