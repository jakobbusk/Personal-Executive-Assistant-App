import { CalendarEvent } from '../calendar/calendar.interface';

export interface DailySummaryInput {
  date: Date;
  events: CalendarEvent[];
  newsItems: { title: string; description?: string; url: string; feedCategory?: string }[];
  userTimezone: string;
}

export interface SummarySection {
  type: string;
  title: string;
  content: unknown;
  order: number;
}

export function generateDailySummary(input: DailySummaryInput): { sections: SummarySection[]; content: unknown } {
  const { events, newsItems, date } = input;

  const schedule = buildScheduleSections(events, date);
  const conflicts = detectConflicts(events);
  const focusBlocks = suggestFocusBlocks(events, date);
  const news = buildNewsSections(newsItems);
  const priorities = derivePriorities(events, newsItems);

  const sections: SummarySection[] = [
    { type: 'schedule', title: "Today's Schedule", content: schedule, order: 0 },
    { type: 'conflicts', title: 'Conflicts & Alerts', content: conflicts, order: 1 },
    { type: 'focus_blocks', title: 'Suggested Focus Blocks', content: focusBlocks, order: 2 },
    { type: 'news', title: 'Top News', content: news, order: 3 },
    { type: 'priorities', title: '3 Priorities', content: priorities, order: 4 },
  ];

  const content = {
    date: date.toISOString(),
    totalMeetings: events.filter((e) => !e.isAllDay).length,
    totalMeetingHours: events
      .filter((e) => !e.isAllDay)
      .reduce((sum, e) => sum + (e.endTime.getTime() - e.startTime.getTime()) / 3_600_000, 0),
  };

  return { sections, content };
}

function buildScheduleSections(events: CalendarEvent[], date: Date) {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const morning: CalendarEvent[] = [];
  const midday: CalendarEvent[] = [];
  const afternoon: CalendarEvent[] = [];

  for (const event of events.filter((e) => !e.isAllDay)) {
    const hour = event.startTime.getHours();
    if (hour < 12) morning.push(event);
    else if (hour < 14) midday.push(event);
    else afternoon.push(event);
  }

  const formatEvent = (e: CalendarEvent) => ({
    title: e.title,
    start: e.startTime.toISOString(),
    end: e.endTime.toISOString(),
    location: e.location,
    attendeeCount: e.attendees.length,
  });

  return {
    morning: morning.map(formatEvent),
    midday: midday.map(formatEvent),
    afternoon: afternoon.map(formatEvent),
    allDay: events.filter((e) => e.isAllDay).map((e) => ({ title: e.title })),
    dayStart: dayStart.toISOString(),
  };
}

function detectConflicts(events: CalendarEvent[]) {
  const timed = events.filter((e) => !e.isAllDay).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const conflicts: { eventA: string; eventB: string; type: string }[] = [];

  for (let i = 0; i < timed.length - 1; i++) {
    const a = timed[i];
    const b = timed[i + 1];

    if (a.endTime > b.startTime) {
      conflicts.push({ eventA: a.title, eventB: b.title, type: 'overlap' });
    } else {
      const gapMinutes = (b.startTime.getTime() - a.endTime.getTime()) / 60000;
      if (gapMinutes < 15 && gapMinutes >= 0) {
        conflicts.push({ eventA: a.title, eventB: b.title, type: 'short_gap' });
      }
    }

    if (a.location && b.location && a.location !== b.location) {
      const gapMinutes = (b.startTime.getTime() - a.endTime.getTime()) / 60000;
      if (gapMinutes < 30) {
        conflicts.push({ eventA: a.title, eventB: b.title, type: 'travel_buffer' });
      }
    }
  }

  return conflicts;
}

function suggestFocusBlocks(events: CalendarEvent[], date: Date) {
  const timed = events.filter((e) => !e.isAllDay).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const workStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0);
  const workEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0);
  const blocks: { start: string; end: string; durationMinutes: number }[] = [];

  let cursor = workStart;
  for (const event of timed) {
    if (event.startTime > cursor) {
      const gapMinutes = (event.startTime.getTime() - cursor.getTime()) / 60000;
      if (gapMinutes >= 30) {
        blocks.push({
          start: cursor.toISOString(),
          end: event.startTime.toISOString(),
          durationMinutes: Math.round(gapMinutes),
        });
      }
    }
    if (event.endTime > cursor) cursor = event.endTime;
  }

  if (cursor < workEnd) {
    const gapMinutes = (workEnd.getTime() - cursor.getTime()) / 60000;
    if (gapMinutes >= 30) {
      blocks.push({
        start: cursor.toISOString(),
        end: workEnd.toISOString(),
        durationMinutes: Math.round(gapMinutes),
      });
    }
  }

  return blocks;
}

function buildNewsSections(newsItems: DailySummaryInput['newsItems']) {
  return newsItems.slice(0, 5).map((item) => ({
    title: item.title,
    summary: item.description?.slice(0, 200),
    url: item.url,
    category: item.feedCategory,
  }));
}

function derivePriorities(events: CalendarEvent[], newsItems: DailySummaryInput['newsItems']) {
  const priorities: string[] = [];

  const highStakeMeetings = events
    .filter((e) => !e.isAllDay && e.attendees.length > 2)
    .sort((a, b) => b.attendees.length - a.attendees.length);
  if (highStakeMeetings.length > 0) {
    priorities.push(`Prepare for "${highStakeMeetings[0].title}" (${highStakeMeetings[0].attendees.length} attendees)`);
  }

  if (newsItems.length > 0) {
    priorities.push(`Stay informed: ${newsItems[0].title}`);
  }

  priorities.push('Use focus blocks for deep work - avoid distractions');

  return priorities.slice(0, 3);
}
