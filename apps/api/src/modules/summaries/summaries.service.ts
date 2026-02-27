import { prisma } from '../../db/prisma';

export const summariesService = {
  async list(userId: string, params: { type?: string; limit: number; offset: number }) {
    return prisma.summary.findMany({
      where: { userId, ...(params.type ? { type: params.type } : {}) },
      orderBy: { date: 'desc' },
      take: params.limit,
      skip: params.offset,
      include: { sections: { orderBy: { order: 'asc' } } },
    });
  },

  async get(userId: string, summaryId: string) {
    return prisma.summary.findFirst({
      where: { id: summaryId, userId },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
  },

  async count(userId: string, type?: string) {
    return prisma.summary.count({
      where: { userId, ...(type ? { type } : {}) },
    });
  },
};
