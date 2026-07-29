const wrapHtmlPage = (title: string, bodyContent: string): string => `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc;">
    ${bodyContent}
  </body>
</html>`;

export const messageNotifications = {
  emailVerified: wrapHtmlPage(
    "Email ya verificado - Embutidos Coquito",
    `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8fafc;
            padding: 24px;
            box-sizing: border-box;
          ">
            <h1 style="
              font-size: 2rem;
              font-weight: 800;
              color: #16a34a;
              margin-bottom: 1rem;
              text-align: center;
            ">
              ¡Email ya verificado!
            </h1>
            <p style="
              font-size: 1.15rem;
              color: #475569;
              margin-bottom: 2rem;
              text-align: center;
            ">
              Ya puedes iniciar sesión.
            </p>
            <div style="margin-top: 1rem;">
              <svg width="80" height="80" viewBox="0 0 24 24" style="display:block;margin:auto;">
                <circle cx="12" cy="12" r="10" fill="#bbf7d0"/>
                <path d="M7 13l3 3 6-6" stroke="#16a34a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>`,
  ),
  emailVerifiedSuccess: wrapHtmlPage(
    "Email verificado - Embutidos Coquito",
    `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8fafc;
            padding: 24px;
            box-sizing: border-box;
          ">
            <h1 style="
              font-size: 2rem;
              font-weight: 800;
              color: #16a34a;
              margin-bottom: 1rem;
              text-align: center;
            ">
              ¡Email verificado exitosamente!
            </h1>
            <p style="
              font-size: 1.15rem;
              color: #475569;
              margin-bottom: 2rem;
              text-align: center;
            ">
              Ya puedes iniciar sesión.
            </p>
            <div style="margin-top: 1rem;">
              <svg width="80" height="80" viewBox="0 0 24 24" style="display:block;margin:auto;">
                <circle cx="12" cy="12" r="10" fill="#bbf7d0"/>
                <path d="M7 13l3 3 6-6" stroke="#16a34a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>`,
  ),
  emailVerifiedError: (message: string) =>
    wrapHtmlPage(
      "Error de verificación - Embutidos Coquito",
      `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8fafc;
            padding: 24px;
            box-sizing: border-box;
          ">
            <h1 style="
              font-size: 2rem;
              font-weight: 800;
              color: #dc2626;
              margin-bottom: 1rem;
              text-align: center;
            ">
              No se pudo verificar el email
            </h1>
            <p style="
              font-size: 1.15rem;
              color: #475569;
              margin-bottom: 2rem;
              text-align: center;
            ">
              ${message}
            </p>
          </div>`,
    ),
};
