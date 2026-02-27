import nodemailer from 'nodemailer';
import { EmailAdapter } from './email.interface';
import { env } from '../../config/env';

export class SmtpEmailAdapter implements EmailAdapter {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: env.SMTP_USER
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
  });

  async sendMagicLink(to: string, link: string): Promise<void> {
    await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Your login link',
      html: `<p>Click <a href="${link}">here</a> to log in. This link expires in ${env.MAGIC_LINK_EXPIRES_IN} minutes.</p>`,
    });
  }

  async sendSummary(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
  }
}
