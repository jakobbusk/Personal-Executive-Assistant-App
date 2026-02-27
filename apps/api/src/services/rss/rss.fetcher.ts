import Parser from 'rss-parser';
import { prisma } from '../../db/prisma';
import { logger } from '../../config/logger';
import crypto from 'crypto';

const parser = new Parser();

export async function fetchAndStoreRssFeed(feedId: string): Promise<number> {
  const feed = await prisma.rssFeed.findUnique({ where: { id: feedId } });
  if (!feed) throw new Error(`Feed ${feedId} not found`);

  let parsed;
  try {
    parsed = await parser.parseURL(feed.url);
  } catch (err) {
    logger.error({ err, feedId }, 'Failed to parse RSS feed');
    throw err;
  }

  await prisma.rssFeed.update({
    where: { id: feedId },
    data: {
      title: parsed.title ?? feed.title,
      description: parsed.description ?? feed.description,
      lastFetchAt: new Date(),
    },
  });

  let newItems = 0;
  for (const item of parsed.items ?? []) {
    const url = item.link ?? item.guid ?? '';
    if (!url) continue;
    const urlHash = crypto.createHash('sha256').update(url).digest('hex');

    const existing = await prisma.rssItem.findUnique({ where: { feedId_urlHash: { feedId, urlHash } } });
    if (existing) continue;

    await prisma.rssItem.create({
      data: {
        feedId,
        externalId: item.guid ?? null,
        url,
        title: item.title ?? '(No title)',
        description: item.contentSnippet ?? item.summary ?? null,
        content: item.content ?? null,
        author: item.creator ?? item.author ?? null,
        publishedAt: item.pubDate ? new Date(item.pubDate) : null,
        urlHash,
      },
    });
    newItems++;
  }

  return newItems;
}
