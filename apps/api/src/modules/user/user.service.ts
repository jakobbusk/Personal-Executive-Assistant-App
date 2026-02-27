import { prisma } from '../../db/prisma';
import { InputJsonValue } from '@prisma/client/runtime/library';

export const userService = {
  async getUser(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  },

  async updateUser(userId: string, data: { name?: string; timezone?: string; emailPreferences?: Record<string, unknown>; scheduleConfig?: Record<string, unknown> }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        emailPreferences: data.emailPreferences as InputJsonValue | undefined,
        scheduleConfig: data.scheduleConfig as InputJsonValue | undefined,
      },
    });
  },
};
