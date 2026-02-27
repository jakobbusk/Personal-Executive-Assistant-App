import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { emailService } from '../../services/email/email.service';

const magicLinkTokens = new Map<string, { email: string; expiresAt: Date }>();

export const authService = {
  async sendMagicLink(email: string): Promise<void> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + env.MAGIC_LINK_EXPIRES_IN * 60 * 1000);
    magicLinkTokens.set(token, { email, expiresAt });

    const link = `${env.CORS_ORIGIN}/auth/verify?token=${token}`;
    await emailService.sendMagicLink(email, link);
    logger.info({ email }, 'Magic link sent');
  },

  async verifyMagicLink(token: string): Promise<string | null> {
    const data = magicLinkTokens.get(token);
    if (!data || data.expiresAt < new Date()) {
      return null;
    }
    magicLinkTokens.delete(token);

    let user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      user = await prisma.user.create({ data: { email: data.email } });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jwtToken = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({ data: { userId: user.id, token: jwtToken, expiresAt } });

    return jwtToken;
  },

  async logout(token: string): Promise<void> {
    await prisma.session.deleteMany({ where: { token } });
  },
};
