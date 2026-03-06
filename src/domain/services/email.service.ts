import { IEmailAdapter } from "../interfaces/email.interface";

export class EmailService {
  constructor(
    private readonly emailAdapter: IEmailAdapter,
    private readonly webServiceUrl: string,
  ) {}

  /**
   * Envía email de verificación de cuenta
   * @param email - Email del usuario
   * @param username - Nombre de usuario
   * @param token - Token de verificación JWT
   */
  async sendEmailVerification(
    email: string,
    username: string,
    token: string,
  ): Promise<boolean> {
    const verificationLink = `${this.webServiceUrl}/auth/verify-email/${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .logo-container { text-align: center; margin-bottom: 30px; }
            .logo { 
              max-width: 280px; 
              height: auto; 
              border-radius: 15px; 
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              background: white;
              padding: 15px;
            }
            .header { color:rgb(98, 101, 26); font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
            .span { color:rgb(98, 101, 26); font-size: 14px; font-weight: bold; margin-bottom: 20px; }
            .button { 
              background-color: #4CAF50; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              display: inline-block;
              margin: 20px 0;
            }
            .footer { color: #666; font-size: 12px; margin-top: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo-container">
              <img src="https://i.ytimg.com/vi/DYDUIHhfBws/hq720.jpg" alt="Embutidos Coquito" class="logo">
            </div>
            <div class="header">¡Bienvenido a Embutidos Coquito!</div>
            <p>Hola <strong>${username}</strong>,</p>
            <p>Gracias por ser parte de "Embutidos Coquito". Para activar tu cuenta, por favor verifica tu email haciendo clic en el siguiente botón:</p>
            <span>Verificar email -> </span><a href="${verificationLink}" class="button">${email}</a>
            <p class="footer">
              Este enlace expirará en 15 minutos.<br>
              Si no solicitaste esta verificación, ignora este mensaje.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.emailAdapter.sendEmail({
      to: email,
      subject: "Verifica tu cuenta - Embutidos Coquito",
      html: htmlContent,
    });
  }

  /**
   * Envía email de recuperación de contraseña
   * @param email - Email del usuario
   * @param username - Nombre de usuario
   * @param token - Token de recuperación JWT
   */
  async sendPasswordRecovery(
    email: string,
    username: string,
    token: string,
  ): Promise<boolean> {
    // Link apunta al BACKEND que sirve la página HTML
    const recoveryLink = `${this.webServiceUrl}/auth/reset-password-page/${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .logo-container { text-align: center; margin-bottom: 30px; }
            .logo { 
              max-width: 280px; 
              height: auto; 
              border-radius: 15px; 
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              background: white;
              padding: 15px;
            }
            .header { color: #FF5722; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
            .button { 
              background-color: #FF5722; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              display: inline-block;
              margin: 20px 0;
            }
            .footer { color: #666; font-size: 12px; margin-top: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo-container">
              <img src="https://i.ytimg.com/vi/DYDUIHhfBws/hq720.jpg" alt="Embutidos Coquito" class="logo">
            </div>
            <div class="header">Recuperación de Contraseña</div>
            <p>Hola <strong>${username}</strong>,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <a href="${recoveryLink}" class="button">Restablecer Contraseña</a>
            <p class="footer">
              Este enlace expirará en 15 minutos.<br>
              Si no solicitaste este cambio, ignora este mensaje y tu contraseña permanecerá sin cambios.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.emailAdapter.sendEmail({
      to: email,
      subject: "Recuperación de Contraseña - Embutidos Coquito",
      html: htmlContent,
    });
  }

  /**
   * Envía notificación de cierre de caja (opcional)
   * @param email - Email del vendedor
   * @param cashierName - Nombre del vendedor
   * @param totalSales - Total de ventas
   * @param date - Fecha del cierre
   */
  // async sendCashRegisterClosureNotification(
  //   email: string,
  //   cashierName: string,
  //   totalSales: number,
  //   date: Date
  // ): Promise<boolean> {
  //   const htmlContent = `
  //     <!DOCTYPE html>
  //     <html>
  //       <head>
  //         <style>
  //           body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
  //           .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
  //           .header { color: #2196F3; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
  //           .info-box { background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0; }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="container">
  //           <div class="header">Cierre de Caja Registrado</div>
  //           <p>Hola <strong>${cashierName}</strong>,</p>
  //           <p>Tu cierre de caja ha sido registrado exitosamente.</p>
  //           <div class="info-box">
  //             <p><strong>Fecha:</strong> ${date.toLocaleDateString('es-ES')}</p>
  //             <p><strong>Total de Ventas:</strong> $${totalSales.toFixed(2)}</p>
  //           </div>
  //           <p>Gracias por tu trabajo.</p>
  //         </div>
  //       </body>
  //     </html>
  //   `;

  //   return this.emailAdapter.sendEmail({
  //     to: email,
  //     subject: "Cierre de Caja Confirmado - Embutidos Coquito",
  //     html: htmlContent,
  //   });
  // }
}
