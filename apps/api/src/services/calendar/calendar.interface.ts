export interface CalendarEvent {
  externalId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  attendees: { email: string; name?: string; status?: string }[];
}

export interface CalendarAdapter {
  getEvents(accessToken: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }>;
}
