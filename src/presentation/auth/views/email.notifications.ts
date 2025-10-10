
export const messageNotifications = {
  emailVerified: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
            background: #f8fafc;
          ">
            <h1 style="
              font-size: 2.8rem;
              font-weight: 800;
              color: #16a34a;
              margin-bottom: 1rem;
              text-shadow: 1px 1px 2px #d1fae5;
              text-align: center;
            ">
              ¡Email ya verificado!
            </h1>
            <p style="
              font-size: 1.5rem;
              color: #475569;
              margin-bottom: 2.5rem;
              text-align: center;
            ">
              Ya puedes iniciar sesión.
            </p>
            <div style="
              margin-top: 1.7rem;
            ">
              <svg width="80" height="80" viewBox="0 0 24 24" style="display:block;margin:auto;">
                <circle cx="12" cy="12" r="10" fill="#bbf7d0"/>
                <path d="M7 13l3 3 6-6" stroke="#16a34a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>`,
  emailVerifiedSuccess: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
            background: #f8fafc;
          ">
            <h1 style="
              font-size: 2.8rem;
              font-weight: 800;
              color: #16a34a;
              margin-bottom: 1rem;
              text-shadow: 1px 1px 2px #d1fae5;
              text-align: center;
            ">
              ¡Email verificado exitosamente!
            </h1>
            <p style="
              font-size: 1.5rem;
              color: #475569;
              margin-bottom: 2.5rem;
              text-align: center;
            ">
              Ya puedes iniciar sesión.
            </p>
          </div>`,
}