import { prisma } from '../../db/prisma';

export const integrationsService = {
  async list(userId: string) {
    return prisma.integration.findMany({
      where: { userId },
      include: { syncLogs: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
  },

  async get(userId: string, integrationId: string) {
    return prisma.integration.findFirst({ where: { id: integrationId, userId } });
  },

  async disconnect(userId: string, integrationId: string) {
    await prisma.integration.delete({ where: { id: integrationId, userId } });
  },
};
