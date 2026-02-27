import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { userService } from './user.service';
import { updateUserSchema } from './user.schema';

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await userService.getUser(req.user!.id);
  res.json({ user });
});

userRouter.patch('/profile', validate(updateUserSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await userService.updateUser(req.user!.id, req.body);
  res.json({ user });
});
