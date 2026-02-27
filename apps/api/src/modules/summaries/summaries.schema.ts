import { z } from 'zod';

export const listSummariesSchema = z.object({
  type: z.enum(['daily', 'weekly']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});
