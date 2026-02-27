import { prisma } from '../../db/prisma';
import crypto from 'crypto';

export const rssService = {
  async listFeeds(userId: string) {
    return prisma.rssFeed.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  async createFeed(userId: string, data: { url: string; category?: string }) {
    return prisma.rssFeed.create({ data: { userId, ...data } });
  },

  async updateFeed(userId: string, feedId: string, data: { category?: string; isActive?: boolean }) {
    return prisma.rssFeed.update({ where: { id: feedId, userId }, data });
  },

  async deleteFeed(userId: string, feedId: string) {
    await prisma.rssFeed.delete({ where: { id: feedId, userId } });
  },

  async listItems(userId: string, feedId?: string, limit = 50) {
    return prisma.rssItem.findMany({
      where: {
        feed: { userId },
        ...(feedId ? { feedId } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: { feed: { select: { title: true, category: true } } },
    });
  },

  async saveItem(userId: string, itemId: string) {
    const item = await prisma.rssItem.findFirst({
      where: { id: itemId, feed: { userId } },
    });
    if (!item) throw new Error('Item not found');
    return prisma.rssItem.update({ where: { id: itemId }, data: { isSaved: true } });
  },

  hashUrl(url: string): string {
    return crypto.createHash('sha256').update(url).digest('hex');
  },
};
