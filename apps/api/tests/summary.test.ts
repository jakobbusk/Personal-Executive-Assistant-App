import { describe, it, expect } from 'vitest';
import { generateDailySummary, DailySummaryInput } from '../src/services/summary/daily.generator';
import { generateWeeklySummary, WeeklySummaryInput } from '../src/services/summary/weekly.generator';
import { CalendarEvent } from '../src/services/calendar/calendar.interface';

const mockEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  externalId: 'evt-1',
  title: 'Standup',
  startTime: new Date('2024-01-15T09:00:00'),
  endTime: new Date('2024-01-15T09:30:00'),
  isAllDay: false,
  attendees: [{ email: 'team@example.com', name: 'Team' }],
  ...overrides,
});

describe('generateDailySummary', () => {
  it('returns sections and content', () => {
    const input: DailySummaryInput = {
      date: new Date('2024-01-15'),
      events: [mockEvent()],
      newsItems: [{ title: 'News headline', url: 'https://example.com', description: 'Some news' }],
      userTimezone: 'UTC',
    };

    const result = generateDailySummary(input);
    expect(result.sections).toHaveLength(5);
    expect(result.sections.map((s) => s.type)).toContain('schedule');
    expect(result.sections.map((s) => s.type)).toContain('conflicts');
    expect(result.sections.map((s) => s.type)).toContain('news');
    expect(result.sections.map((s) => s.type)).toContain('priorities');
    expect(result.content).toHaveProperty('totalMeetings', 1);
  });

  it('detects overlapping events as conflicts', () => {
    const input: DailySummaryInput = {
      date: new Date('2024-01-15'),
      events: [
        mockEvent({ externalId: 'e1', title: 'Meeting A', startTime: new Date('2024-01-15T09:00:00'), endTime: new Date('2024-01-15T10:00:00') }),
        mockEvent({ externalId: 'e2', title: 'Meeting B', startTime: new Date('2024-01-15T09:30:00'), endTime: new Date('2024-01-15T10:30:00') }),
      ],
      newsItems: [],
      userTimezone: 'UTC',
    };

    const result = generateDailySummary(input);
    const conflictSection = result.sections.find((s) => s.type === 'conflicts');
    const conflicts = conflictSection?.content as { type: string }[];
    expect(conflicts.some((c) => c.type === 'overlap')).toBe(true);
  });

  it('suggests focus blocks in free time', () => {
    const input: DailySummaryInput = {
      date: new Date('2024-01-15'),
      events: [
        mockEvent({ startTime: new Date('2024-01-15T09:00:00'), endTime: new Date('2024-01-15T09:30:00') }),
      ],
      newsItems: [],
      userTimezone: 'UTC',
    };

    const result = generateDailySummary(input);
    const focusSection = result.sections.find((s) => s.type === 'focus_blocks');
    const blocks = focusSection?.content as { durationMinutes: number }[];
    expect(blocks.length).toBeGreaterThan(0);
  });

  it('derives up to 3 priorities', () => {
    const input: DailySummaryInput = {
      date: new Date('2024-01-15'),
      events: [
        mockEvent({
          attendees: [
            { email: 'a@ex.com' }, { email: 'b@ex.com' }, { email: 'c@ex.com' }, { email: 'd@ex.com' },
          ],
        }),
      ],
      newsItems: [{ title: 'Big News', url: 'https://news.com' }],
      userTimezone: 'UTC',
    };

    const result = generateDailySummary(input);
    const prioritySection = result.sections.find((s) => s.type === 'priorities');
    const priorities = prioritySection?.content as string[];
    expect(priorities.length).toBeGreaterThanOrEqual(1);
    expect(priorities.length).toBeLessThanOrEqual(3);
  });
});

describe('generateWeeklySummary', () => {
  const weekStart = new Date('2024-01-15');
  const weekEnd = new Date('2024-01-21');

  it('returns sections and content', () => {
    const input: WeeklySummaryInput = {
      weekStart,
      weekEnd,
      events: [mockEvent()],
      userTimezone: 'UTC',
    };

    const result = generateWeeklySummary(input);
    expect(result.sections).toHaveLength(4);
    expect(result.sections.map((s) => s.type)).toContain('meetings_by_day');
    expect(result.sections.map((s) => s.type)).toContain('time_allocation');
    expect(result.sections.map((s) => s.type)).toContain('risk_flags');
    expect(result.sections.map((s) => s.type)).toContain('suggestions');
  });

  it('flags overloaded days', () => {
    const heavyDayEvents = Array.from({ length: 8 }, (_, i) =>
      mockEvent({
        externalId: `e-${i}`,
        startTime: new Date(`2024-01-15T${String(8 + i).padStart(2, '0')}:00:00`),
        endTime: new Date(`2024-01-15T${String(9 + i).padStart(2, '0')}:00:00`),
      })
    );

    const input: WeeklySummaryInput = {
      weekStart,
      weekEnd,
      events: heavyDayEvents,
      userTimezone: 'UTC',
    };

    const result = generateWeeklySummary(input);
    const riskSection = result.sections.find((s) => s.type === 'risk_flags');
    const flags = riskSection?.content as { type: string }[];
    expect(flags.some((f) => f.type === 'overloaded_day')).toBe(true);
  });
});
