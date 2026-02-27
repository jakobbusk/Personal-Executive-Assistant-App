import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../../middleware/auth';
import { analyticsService } from './analytics.service';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

analyticsRouter.get('/meeting-hours', async (req: AuthRequest, res: Response): Promise<void> => {
  const start = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 30 * 86400000);
  const end = req.query.end ? new Date(req.query.end as string) : new Date();
  const data = await analyticsService.getMeetingHoursPerDay(req.user!.id, start, end);
  res.json({ data });
});

analyticsRouter.get('/summary-stats', async (req: AuthRequest, res: Response): Promise<void> => {
  const stats = await analyticsService.getSummaryStats(req.user!.id);
  res.json({ stats });
});
