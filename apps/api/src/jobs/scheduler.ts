import cron from 'cron-parser';
import { dailySummaryQueue, weeklySummaryQueue, rssFetchQueue } from './queue';
import { logger } from '../config/logger';
import { prisma } from '../db/prisma';

export async function startScheduler(): Promise<void> {
  logger.info('Starting job scheduler');

  scheduleCron('0 7 * * *', async () => {
    const users = await prisma.user.findMany();
    for (const user of users) {
      await dailySummaryQueue.add('generate-daily', { userId: user.id, timezone: user.timezone });
    }
    logger.info({ count: users.length }, 'Queued daily summaries');
  });

  scheduleCron('0 18 * * 0', async () => {
    const users = await prisma.user.findMany();
    for (const user of users) {
      await weeklySummaryQueue.add('generate-weekly', { userId: user.id, timezone: user.timezone });
    }
    logger.info({ count: users.length }, 'Queued weekly summaries');
  });

  scheduleCron('0 * * * *', async () => {
    const feeds = await prisma.rssFeed.findMany({ where: { isActive: true } });
    for (const feed of feeds) {
      await rssFetchQueue.add('fetch-rss', { feedId: feed.id });
    }
    logger.info({ count: feeds.length }, 'Queued RSS fetches');
  });
}

function scheduleCron(expression: string, handler: () => Promise<void>): void {
  const runNext = (): void => {
    try {
      const interval = cron.parseExpression(expression);
      const next = interval.next().toDate();
      const delay = next.getTime() - Date.now();
      setTimeout(async () => {
        try {
          await handler();
        } catch (err) {
          logger.error({ err }, 'Scheduled job error');
        }
        runNext();
      }, delay);
    } catch (err) {
      logger.error({ err, expression }, 'Failed to parse cron expression');
    }
  };
  runNext();
}
