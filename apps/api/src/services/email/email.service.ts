import { EmailAdapter } from './email.interface';
import { MockEmailAdapter } from './mock.adapter';
import { SmtpEmailAdapter } from './smtp.adapter';
import { env } from '../../config/env';

export const emailService: EmailAdapter =
  env.SMTP_HOST ? new SmtpEmailAdapter() : new MockEmailAdapter();
