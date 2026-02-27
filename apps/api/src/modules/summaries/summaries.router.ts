import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { summariesService } from './summaries.service';
import { listSummariesSchema } from './summaries.schema';

export const summariesRouter = Router();

summariesRouter.use(requireAuth);

summariesRouter.get('/', validate(listSummariesSchema, 'query'), async (req: AuthRequest, res: Response): Promise<void> => {
  const params = req.query as unknown as { type?: string; limit: number; offset: number };
  const [summaries, total] = await Promise.all([
    summariesService.list(req.user!.id, params),
    summariesService.count(req.user!.id, params.type),
  ]);
  res.json({ summaries, total });
});

summariesRouter.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const summary = await summariesService.get(req.user!.id, String(req.params['id']));
  if (!summary) {
    res.status(404).json({ error: 'Summary not found' });
    return;
  }
  res.json({ summary });
});
