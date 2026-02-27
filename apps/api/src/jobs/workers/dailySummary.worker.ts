import { Worker, Job } from 'bullmq';
import { env } from '../../config/env';
import { prisma } from '../../db/prisma';
import { logger } from '../../config/logger';
import { generateDailySummary } from '../../services/summary/daily.generator';
import { MockCalendarAdapter } from '../../services/calendar/mock.adapter';
import { emailService } from '../../services/email/email.service';
import { InputJsonValue } from '@prisma/client/runtime/library';

const connection = { url: env.REDIS_URL };

export function startDailySummaryWorker(): Worker {
  return new Worker(
    'daily-summary',
    async (job: Job) => {
      const { userId } = job.data as { userId: string; timezone: string };
      logger.info({ userId }, 'Generating daily summary');

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return;

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const calendarAdapter = new MockCalendarAdapter();
      const events = await calendarAdapter.getEvents('', today, tomorrow);

      const newsItems = await prisma.rssItem
        .findMany({
          where: { feed: { userId }, publishedAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } },
          orderBy: { publishedAt: 'desc' },
          take: 10,
          include: { feed: { select: { category: true } } },
        })
        .then((items) =>
          items.map((i) => ({
            title: i.title,
            description: i.description ?? undefined,
            url: i.url,
            feedCategory: i.feed.category ?? undefined,
          }))
        );

      const { sections, content } = generateDailySummary({ date: today, events, newsItems, userTimezone: user.timezone });

      const summary = await prisma.summary.create({
        data: {
          userId,
          type: 'daily',
          date: today,
          status: 'generated',
          content: content as InputJsonValue,
          generatedAt: new Date(),
          sections: { create: sections.map((s) => ({ ...s, content: s.content as InputJsonValue })) },
        },
      });

      const htmlContent = renderSummaryHtml(summary.id, 'Daily Executive Summary', sections);
      await emailService.sendSummary(user.email, `Daily Executive Summary - ${today.toDateString()}`, htmlContent);

      await prisma.deliveryLog.create({
        data: { userId, summaryId: summary.id, channel: 'email', status: 'sent', recipient: user.email, sentAt: new Date() },
      });

      await prisma.summary.update({ where: { id: summary.id }, data: { status: 'sent' } });
      logger.info({ userId, summaryId: summary.id }, 'Daily summary sent');
    },
    { connection }
  );
}

function renderSummaryHtml(summaryId: string, title: string, sections: { type: string; title: string; content: unknown }[]): string {
  const sectionsHtml = sections
    .map(
      (s) => `
    <div style="margin-bottom: 24px;">
      <h2 style="color: #1a1a2e; border-bottom: 2px solid #4f46e5; padding-bottom: 8px;">${s.title}</h2>
      <pre style="background: #f8f9fa; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${JSON.stringify(s.content, null, 2)}</pre>
    </div>`
    )
    .join('');

  return `
    <html>
      <body style="font-family: sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4f46e5;">${title}</h1>
        ${sectionsHtml}
        <p style="color: #666; font-size: 12px;">Summary ID: ${summaryId}</p>
      </body>
    </html>`;
}
