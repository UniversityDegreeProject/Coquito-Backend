import nodemailer, { Transporter } from "nodemailer";
import { IEmailAdapter, SendEmailOptions } from "../domain";

export class EmailAdapter implements IEmailAdapter {
  private readonly transporter: Transporter;

  constructor(
    private readonly mailerService: string,
    private readonly mailerEmail: string,
    private readonly senderEmailPassword: string,
    private readonly fromEmail: string,
  ) {
    this.transporter = nodemailer.createTransport({
      service: this.mailerService,
      auth: {
        user: this.mailerEmail,
        pass: this.senderEmailPassword,
      },
    });
  }

  /**
   * Envía un email usando nodemailer
   * @param options - Opciones del email (to, subject, html)
   * @returns Promise<boolean> - true si se envió correctamente, false si falló
   */

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const { to, subject, html, attachments = [] } = options;

    try {
      const sentInfo = await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
        attachments,
      });

      //? Validamos que el email fue aceptado
      if (sentInfo.accepted && sentInfo.accepted.length > 0) {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}
