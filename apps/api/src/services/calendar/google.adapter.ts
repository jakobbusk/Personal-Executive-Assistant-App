import { CalendarAdapter, CalendarEvent } from './calendar.interface';
import { logger } from '../../config/logger';

export class GoogleCalendarAdapter implements CalendarAdapter {
  async getEvents(accessToken: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      logger.error({ status: response.status }, 'Google Calendar API error');
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data = await response.json() as { items?: GoogleCalendarEventItem[] };
    return (data.items ?? []).map(mapGoogleEvent);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      }),
    });

    if (!response.ok) throw new Error('Failed to refresh Google token');
    const data = await response.json() as { access_token: string; expires_in: number };
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }
}

interface GoogleCalendarEventItem {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  attendees?: { email: string; displayName?: string; responseStatus?: string }[];
}

function mapGoogleEvent(item: GoogleCalendarEventItem): CalendarEvent {
  const isAllDay = !item.start.dateTime;
  return {
    externalId: item.id,
    title: item.summary ?? '(No title)',
    description: item.description,
    location: item.location,
    startTime: new Date(item.start.dateTime ?? item.start.date ?? ''),
    endTime: new Date(item.end.dateTime ?? item.end.date ?? ''),
    isAllDay,
    attendees: (item.attendees ?? []).map((a) => ({
      email: a.email,
      name: a.displayName,
      status: a.responseStatus,
    })),
  };
}
