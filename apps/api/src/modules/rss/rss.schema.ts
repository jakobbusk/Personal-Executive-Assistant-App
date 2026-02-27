import { z } from 'zod';

export const createFeedSchema = z.object({
  url: z.string().url(),
  category: z.string().optional(),
});

export const updateFeedSchema = z.object({
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});
