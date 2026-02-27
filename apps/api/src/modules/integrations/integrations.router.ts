import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../../middleware/auth';
import { integrationsService } from './integrations.service';

export const integrationsRouter = Router();

integrationsRouter.use(requireAuth);

integrationsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const integrations = await integrationsService.list(req.user!.id);
  res.json({ integrations });
});

integrationsRouter.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  await integrationsService.disconnect(req.user!.id, String(req.params['id']));
  res.json({ message: 'Integration disconnected' });
});
