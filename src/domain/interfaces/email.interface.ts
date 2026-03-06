export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: any[];
}

export interface IEmailAdapter {
  sendEmail(options: SendEmailOptions): Promise<boolean>;
}
