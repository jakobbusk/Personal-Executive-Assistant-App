import { CalendarEvent } from '../calendar/calendar.interface';

export interface WeeklySummaryInput {
  weekStart: Date;
  weekEnd: Date;
  events: CalendarEvent[];
  userTimezone: string;
}

export interface SummarySection {
  type: string;
  title: string;
  content: unknown;
  order: number;
}

export function generateWeeklySummary(input: WeeklySummaryInput): { sections: SummarySection[]; content: unknown } {
  const { events, weekStart, weekEnd } = input;

  const byDay = groupEventsByDay(events, weekStart, weekEnd);
  const timeAllocation = calculateTimeAllocation(events);
  const riskFlags = identifyRiskFlags(events, weekStart, weekEnd);
  const suggestions = generateSuggestions(events, weekStart, weekEnd);

  const sections: SummarySection[] = [
    { type: 'meetings_by_day', title: 'Meetings by Day', content: byDay, order: 0 },
    { type: 'time_allocation', title: 'Time Allocation', content: timeAllocation, order: 1 },
    { type: 'risk_flags', title: 'Risk Flags', content: riskFlags, order: 2 },
    { type: 'suggestions', title: 'Suggestions', content: suggestions, order: 3 },
  ];

  const totalMeetingHours = events
    .filter((e) => !e.isAllDay)
    .reduce((sum, e) => sum + (e.endTime.getTime() - e.startTime.getTime()) / 3_600_000, 0);

  const content = {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totalMeetings: events.filter((e) => !e.isAllDay).length,
    totalMeetingHours: Math.round(totalMeetingHours * 10) / 10,
  };

  return { sections, content };
}

function groupEventsByDay(events: CalendarEvent[], weekStart: Date, weekEnd: Date) {
  const days: Record<string, { date: string; events: { title: string; start: string; end: string; attendeeCount: number }[] }> = {};

  const current = new Date(weekStart);
  while (current <= weekEnd) {
    const key = current.toISOString().split('T')[0];
    days[key] = { date: key, events: [] };
    current.setDate(current.getDate() + 1);
  }

  for (const event of events.filter((e) => !e.isAllDay)) {
    const key = event.startTime.toISOString().split('T')[0];
    if (days[key]) {
      days[key].events.push({
        title: event.title,
        start: event.startTime.toISOString(),
        end: event.endTime.toISOString(),
        attendeeCount: event.attendees.length,
      });
    }
  }

  return Object.values(days);
}

function calculateTimeAllocation(events: CalendarEvent[]) {
  const meetingHours = events
    .filter((e) => !e.isAllDay)
    .reduce((sum, e) => sum + (e.endTime.getTime() - e.startTime.getTime()) / 3_600_000, 0);

  const workingHoursPerWeek = 40;
  const focusHours = Math.max(0, workingHoursPerWeek - meetingHours);

  return {
    meetingHours: Math.round(meetingHours * 10) / 10,
    focusHours: Math.round(focusHours * 10) / 10,
    meetingPercentage: Math.round((meetingHours / workingHoursPerWeek) * 100),
  };
}

function identifyRiskFlags(events: CalendarEvent[], weekStart: Date, weekEnd: Date) {
  const flags: { type: string; message: string; severity: 'high' | 'medium' | 'low' }[] = [];

  const current = new Date(weekStart);
  while (current <= weekEnd) {
    const dayEvents = events.filter(
      (e) =>
        !e.isAllDay &&
        e.startTime.getFullYear() === current.getFullYear() &&
        e.startTime.getMonth() === current.getMonth() &&
        e.startTime.getDate() === current.getDate()
    );
    const dayMeetingHours = dayEvents.reduce(
      (sum, e) => sum + (e.endTime.getTime() - e.startTime.getTime()) / 3_600_000,
      0
    );
    if (dayMeetingHours > 6) {
      flags.push({
        type: 'overloaded_day',
        message: `${current.toDateString()} has ${Math.round(dayMeetingHours * 10) / 10}h of meetings`,
        severity: 'high',
      });
    }

    const shortMeetings = dayEvents.filter(
      (e) => (e.endTime.getTime() - e.startTime.getTime()) / 60000 <= 30
    );
    if (shortMeetings.length > 4) {
      flags.push({
        type: 'context_switch',
        message: `${current.toDateString()} has ${shortMeetings.length} short meetings (context switch risk)`,
        severity: 'medium',
      });
    }

    current.setDate(current.getDate() + 1);
  }

  const totalHours = events
    .filter((e) => !e.isAllDay)
    .reduce((sum, e) => sum + (e.endTime.getTime() - e.startTime.getTime()) / 3_600_000, 0);
  if (totalHours > 25) {
    flags.push({
      type: 'meeting_overload',
      message: `${Math.round(totalHours * 10) / 10}h of meetings this week exceeds recommended 25h`,
      severity: 'high',
    });
  }

  return flags;
}

function generateSuggestions(events: CalendarEvent[], weekStart: Date, weekEnd: Date) {
  const suggestions: string[] = [];
  const current = new Date(weekStart);
  const bestFocusDays: string[] = [];

  while (current <= weekEnd) {
    const dayEvents = events.filter(
      (e) =>
        !e.isAllDay &&
        e.startTime.getFullYear() === current.getFullYear() &&
        e.startTime.getMonth() === current.getMonth() &&
        e.startTime.getDate() === current.getDate()
    );
    const dayMeetingHours = dayEvents.reduce(
      (sum, e) => sum + (e.endTime.getTime() - e.startTime.getTime()) / 3_600_000,
      0
    );
    if (dayMeetingHours < 2) {
      bestFocusDays.push(current.toDateString());
    }
    current.setDate(current.getDate() + 1);
  }

  if (bestFocusDays.length > 0) {
    suggestions.push(`Best focus days: ${bestFocusDays.join(', ')}`);
  }

  const totalHours = events
    .filter((e) => !e.isAllDay)
    .reduce((sum, e) => sum + (e.endTime.getTime() - e.startTime.getTime()) / 3_600_000, 0);
  if (totalHours > 20) {
    suggestions.push('Consider blocking 2-hour deep work sessions in the morning');
  }

  suggestions.push('Batch similar meetings on the same day to reduce context switching');

  return suggestions;
}
