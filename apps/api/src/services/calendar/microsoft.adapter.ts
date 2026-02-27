import { CalendarAdapter, CalendarEvent } from './calendar.interface';
import { logger } from '../../config/logger';

export class MicrosoftCalendarAdapter implements CalendarAdapter {
  async getEvents(accessToken: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      $select: 'id,subject,body,location,start,end,attendees,isAllDay',
      $orderby: 'start/dateTime',
    });

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      logger.error({ status: response.status }, 'Microsoft Graph API error');
      throw new Error(`Microsoft Graph API error: ${response.status}`);
    }

    const data = await response.json() as { value?: MsGraphEvent[] };
    return (data.value ?? []).map(mapMsEvent);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.MICROSOFT_CLIENT_ID ?? '',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
      }),
    });

    if (!response.ok) throw new Error('Failed to refresh Microsoft token');
    const data = await response.json() as { access_token: string; expires_in: number };
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }
}

interface MsGraphEvent {
  id: string;
  subject?: string;
  body?: { content?: string };
  location?: { displayName?: string };
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  isAllDay?: boolean;
  attendees?: { emailAddress: { address: string; name?: string }; status?: { response?: string } }[];
}

function mapMsEvent(item: MsGraphEvent): CalendarEvent {
  return {
    externalId: item.id,
    title: item.subject ?? '(No title)',
    description: item.body?.content,
    location: item.location?.displayName,
    startTime: new Date(item.start.dateTime),
    endTime: new Date(item.end.dateTime),
    isAllDay: item.isAllDay ?? false,
    attendees: (item.attendees ?? []).map((a) => ({
      email: a.emailAddress.address,
      name: a.emailAddress.name,
      status: a.status?.response,
    })),
  };
}
