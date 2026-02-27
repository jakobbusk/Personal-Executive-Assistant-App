import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().optional(),
  emailPreferences: z.record(z.unknown()).optional(),
  scheduleConfig: z.record(z.unknown()).optional(),
});
