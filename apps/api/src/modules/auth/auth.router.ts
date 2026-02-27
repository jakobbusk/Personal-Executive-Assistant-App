import { Router, Request, Response } from 'express';
import { authService } from './auth.service';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/rateLimiter';
import { requestMagicLinkSchema, verifyMagicLinkSchema } from './auth.schema';
import { AuthRequest, requireAuth } from '../../middleware/auth';
import { env } from '../../config/env';

export const authRouter = Router();

authRouter.post('/magic-link', authLimiter, validate(requestMagicLinkSchema), async (req: Request, res: Response): Promise<void> => {
  await authService.sendMagicLink(req.body.email);
  res.json({ message: 'Magic link sent' });
});

authRouter.get('/verify', validate(verifyMagicLinkSchema, 'query'), async (req: Request, res: Response): Promise<void> => {
  const token = await authService.verifyMagicLink(req.query.token as string);
  if (!token) {
    res.status(400).json({ error: 'Invalid or expired token' });
    return;
  }
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ message: 'Authenticated' });
});

authRouter.post('/logout', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  await authService.logout(req.cookies.token);
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

authRouter.get('/me', requireAuth, (req: AuthRequest, res: Response): void => {
  res.json({ user: req.user });
});
