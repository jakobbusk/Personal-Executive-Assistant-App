import { Worker, Job } from 'bullmq';
import { env } from '../../config/env';
import { prisma } from '../../db/prisma';
import { logger } from '../../config/logger';
import { generateWeeklySummary } from '../../services/summary/weekly.generator';
import { MockCalendarAdapter } from '../../services/calendar/mock.adapter';
import { emailService } from '../../services/email/email.service';
import { InputJsonValue } from '@prisma/client/runtime/library';

const connection = { url: env.REDIS_URL };

export function startWeeklySummaryWorker(): Worker {
  return new Worker(
    'weekly-summary',
    async (job: Job) => {
      const { userId } = job.data as { userId: string };
      logger.info({ userId }, 'Generating weekly summary');

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return;

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const calendarAdapter = new MockCalendarAdapter();
      const events = await calendarAdapter.getEvents('', weekStart, weekEnd);

      const { sections, content } = generateWeeklySummary({ weekStart, weekEnd, events, userTimezone: user.timezone });

      const summary = await prisma.summary.create({
        data: {
          userId,
          type: 'weekly',
          date: weekStart,
          status: 'generated',
          content: content as InputJsonValue,
          generatedAt: new Date(),
          sections: { create: sections.map((s) => ({ ...s, content: s.content as InputJsonValue })) },
        },
      });

      const htmlContent = `<html><body style="font-family: sans-serif;"><h1>This is Your Week</h1><pre>${JSON.stringify(sections, null, 2)}</pre></body></html>`;
      await emailService.sendSummary(user.email, `Weekly Overview - Week of ${weekStart.toDateString()}`, htmlContent);

      await prisma.deliveryLog.create({
        data: { userId, summaryId: summary.id, channel: 'email', status: 'sent', recipient: user.email, sentAt: new Date() },
      });

      await prisma.summary.update({ where: { id: summary.id }, data: { status: 'sent' } });
      logger.info({ userId, summaryId: summary.id }, 'Weekly summary sent');
    },
    { connection }
  );
}
