import { prisma } from '../../db/prisma';

export const analyticsService = {
  async getMeetingHoursPerDay(userId: string, startDate: Date, endDate: Date) {
    const events = await prisma.calendarEvent.findMany({
      where: {
        calendarAccount: { integration: { userId } },
        startTime: { gte: startDate, lte: endDate },
        isAllDay: false,
      },
    });

    const byDay: Record<string, number> = {};
    for (const event of events) {
      const day = event.startTime.toISOString().split('T')[0];
      const durationHours = (event.endTime.getTime() - event.startTime.getTime()) / 3_600_000;
      byDay[day] = (byDay[day] ?? 0) + durationHours;
    }
    return byDay;
  },

  async getSummaryStats(userId: string) {
    const [total, daily, weekly] = await Promise.all([
      prisma.summary.count({ where: { userId } }),
      prisma.summary.count({ where: { userId, type: 'daily' } }),
      prisma.summary.count({ where: { userId, type: 'weekly' } }),
    ]);
    return { total, daily, weekly };
  },
};
