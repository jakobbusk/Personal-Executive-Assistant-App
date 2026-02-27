import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { rssService } from './rss.service';
import { createFeedSchema, updateFeedSchema } from './rss.schema';

export const rssRouter = Router();

rssRouter.use(requireAuth);

rssRouter.get('/feeds', async (req: AuthRequest, res: Response): Promise<void> => {
  const feeds = await rssService.listFeeds(req.user!.id);
  res.json({ feeds });
});

rssRouter.post('/feeds', validate(createFeedSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const feed = await rssService.createFeed(req.user!.id, req.body);
  res.status(201).json({ feed });
});

rssRouter.patch('/feeds/:id', validate(updateFeedSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const feed = await rssService.updateFeed(req.user!.id, String(req.params['id']), req.body);
  res.json({ feed });
});

rssRouter.delete('/feeds/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  await rssService.deleteFeed(req.user!.id, String(req.params['id']));
  res.json({ message: 'Feed deleted' });
});

rssRouter.get('/items', async (req: AuthRequest, res: Response): Promise<void> => {
  const { feedId, limit } = req.query;
  const items = await rssService.listItems(req.user!.id, feedId as string, Number(limit) || 50);
  res.json({ items });
});

rssRouter.post('/items/:id/save', async (req: AuthRequest, res: Response): Promise<void> => {
  const item = await rssService.saveItem(req.user!.id, String(req.params['id']));
  res.json({ item });
});
