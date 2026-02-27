import { z } from 'zod';

export const connectIntegrationSchema = z.object({
  provider: z.enum(['google_calendar', 'microsoft_365']),
  code: z.string(),
});
