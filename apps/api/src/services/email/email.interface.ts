export interface EmailAdapter {
  sendMagicLink(to: string, link: string): Promise<void>;
  sendSummary(to: string, subject: string, html: string): Promise<void>;
}
