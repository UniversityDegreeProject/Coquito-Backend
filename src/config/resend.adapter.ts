import { Resend } from "resend";
import { IEmailAdapter, SendEmailOptions } from "../domain";

export class ResendEmailAdapter implements IEmailAdapter {
  private static instance: Resend | null = null;
  private readonly resend: Resend;

  /**
   * @param apiKey La llave de API para autenticarse con Resend
   * @param fromEmail El email desde el que se enviarán los correos
   */
  constructor(
    private readonly apiKey: string,
    private readonly fromEmail: string,
  ) {
    if (!ResendEmailAdapter.instance) {
      ResendEmailAdapter.instance = new Resend(this.apiKey);
    }
    this.resend = ResendEmailAdapter.instance;
  }

  /**
   * Envía un email usando la SDK de Resend
   */
  async sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
    console.log(
      "[RsendEmailAdapter]: correo enviado con el servicio de resend",
    );
    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      });

      if (error) {
        console.error("[ResendEmailAdapter] Error al enviar el email:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("[ResendEmailAdapter] Exception:", error);
      return false;
    }
  }
}
