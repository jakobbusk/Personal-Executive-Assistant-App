import { Worker, Job } from 'bullmq';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { fetchAndStoreRssFeed } from '../../services/rss/rss.fetcher';

const connection = { url: env.REDIS_URL };

export function startRssFetchWorker(): Worker {
  return new Worker(
    'rss-fetch',
    async (job: Job) => {
      const { feedId } = job.data as { feedId: string };
      const count = await fetchAndStoreRssFeed(feedId);
      logger.info({ feedId, count }, 'RSS feed fetched');
    },
    { connection }
  );
}
