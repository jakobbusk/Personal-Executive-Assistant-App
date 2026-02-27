import { CalendarAdapter, CalendarEvent } from './calendar.interface';

export class MockCalendarAdapter implements CalendarAdapter {
  async getEvents(_accessToken: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        events.push({
          externalId: `mock-standup-${current.toISOString().split('T')[0]}`,
          title: 'Daily Standup',
          startTime: new Date(current.getFullYear(), current.getMonth(), current.getDate(), 9, 0),
          endTime: new Date(current.getFullYear(), current.getMonth(), current.getDate(), 9, 30),
          isAllDay: false,
          attendees: [{ email: 'team@example.com', name: 'Team', status: 'accepted' }],
        });
        if (dayOfWeek === 2) {
          events.push({
            externalId: `mock-review-${current.toISOString().split('T')[0]}`,
            title: 'Weekly Review',
            startTime: new Date(current.getFullYear(), current.getMonth(), current.getDate(), 14, 0),
            endTime: new Date(current.getFullYear(), current.getMonth(), current.getDate(), 15, 0),
            isAllDay: false,
            attendees: [],
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }
    return events;
  }

  async refreshToken(_refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
    return {
      accessToken: 'mock-access-token',
      expiresAt: new Date(Date.now() + 3600 * 1000),
    };
  }
}
