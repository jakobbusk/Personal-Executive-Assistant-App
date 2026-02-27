import { Queue } from 'bullmq';
import { env } from '../config/env';

const connection = { url: env.REDIS_URL };

export const dailySummaryQueue = new Queue('daily-summary', { connection });
export const weeklySummaryQueue = new Queue('weekly-summary', { connection });
export const rssFetchQueue = new Queue('rss-fetch', { connection });
