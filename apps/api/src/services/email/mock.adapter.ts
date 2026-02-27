import { EmailAdapter } from './email.interface';
import { logger } from '../../config/logger';

export class MockEmailAdapter implements EmailAdapter {
  async sendMagicLink(to: string, link: string): Promise<void> {
    logger.info({ to, link }, '[MockEmail] Magic link');
  }

  async sendSummary(to: string, subject: string, html: string): Promise<void> {
    logger.info({ to, subject, bodyLength: html.length }, '[MockEmail] Summary email');
  }
}
