import { Request, Response } from "express";
// *Domain
import { 
  HttpCustomErrors, 
  UserRepository, 
  LoginUserDto, 
  LoginUseCaseImpl, 
  AuthRepository,
  VerifyEmailUseCaseImpl,
  ForgotPasswordDto,
  ForgotPasswordUseCaseImpl,
  ResetPasswordDto,
  ResetPasswordUseCaseImpl,
  GetUserEmailUseCaseImpl,
  GetUserByEmailDto,
  RefreshTokenDto,
  RefreshTokenUseCase,
  CreateUserUseCaseImpl,
  RegisterUserDto
} from "../../../domain";
import { BcryptAdapter, JwtAdapter } from "../../../config";
import { EmailService } from "../../../domain/services/email.service";


export class AuthController {
  constructor(
    private readonly userRepository : UserRepository,
    private readonly authRepository : AuthRepository,
    private readonly jwtAdapter : JwtAdapter,
    private readonly emailService : EmailService,
    private readonly bcrypt : BcryptAdapter
  ) {}

  private handleHttpStatusError = ( error: unknown, res : Response ) => {
    if( error instanceof HttpCustomErrors ) {
      return res.status(error.statusCode).json({ error: error.message }); 
    }
    return res.status(500).json({ error: "Internal server error" });
  }


  private sendEmailValidationLink =  async (id : string, email : string, username : string ) : Promise<boolean> => {
    const emailToken = await this.jwtAdapter.generateToken({ id, email }, "15m");
    console.log(emailToken);
    if( !emailToken ) throw HttpCustomErrors.internalServerError("Error al generar el token de verificación de email");
    
    return this.emailService.sendEmailVerification(email, username, emailToken);

  }

  // *Login User
  public loginUser = async (req: Request, res: Response) => {
    const body = req.body;
    const [ error, loginUserDto ] = LoginUserDto.create(body);
    if( error ) return res.status(400).json({ error: error });
    if( !loginUserDto ) return res.status(400).json({ error: "El usuario no pudo ser creado" });

    
    // ? Login User

    new LoginUseCaseImpl(this.authRepository).execute(loginUserDto).then( async (user) => {

      //? Generar Access Token (1 hora)
      const accessToken = await this.jwtAdapter.generateAccessToken({ 
        id: user.id,
      });
      if( !accessToken ) return res.status(500).json({ error: "Error al generar access token" });

      //? Generar Refresh Token (7 días)
      const refreshToken = await this.jwtAdapter.generateRefreshToken({ id: user.id });
      if( !refreshToken ) return res.status(500).json({ error: "Error al generar refresh token" });

      //? Guardar Refresh Token en la base de datos
      await this.userRepository.saveRefreshToken(user.id, refreshToken);

      const { password, ...rest } = user;
      return res.status(200).json({ 
        user: rest,
        accessToken,
        refreshToken
      });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }


  // *Register User
  public registerUser = async (req: Request, res: Response) => {
    const body = req.body;
    const [ error, registerUserDto ] = RegisterUserDto.create(body);
    if( error ) return res.status(400).json({ error: error });
    if( !registerUserDto ) return res.status(400).json({ error: "Datos incorrectos" });

    new CreateUserUseCaseImpl( this.userRepository, this.bcrypt ).execute(registerUserDto).then( async (user) => {

      const { password, ...userWithoutPassword } = user;

      
      //? Generar token de verificación de email (válido por 15m)
      const emailSent = await this.sendEmailValidationLink( user.id, user.email, user.username);
      if( !emailSent ) return res.status(500).json({ error: "Error al enviar el email de verificación" });
      
      
      return res.status(201).json({ 
        user: userWithoutPassword,
        message: "Usuario creado exitosamente. Revisa la bandeja de entrada de tu correo electrónico para verificar la cuenta."
      });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }

  
  // *Retry Verify Email
  public retryVerifyEmail = async(req: Request, res: Response) => {
    const { email } = req.body;
    const [ error, getUserByEmailDto ] = GetUserByEmailDto.create({ email: email });
    if( error ) return res.status(400).json({ error: error });
    if( !getUserByEmailDto ) return res.status(400).json({ error: "Usuario no encontrado" });
    const user = await new GetUserEmailUseCaseImpl(this.userRepository).execute(getUserByEmailDto);
    if( !user ) return res.status(400).json({ error: "Usuario no encontrado" });
    const emailSent = await this.sendEmailValidationLink(user.id, user.email, user.username);
    if( !emailSent ) return res.status(500).json({ error: "Error al enviar el email de verificación" });
    return res.status(200).json({ message: "Email de verificación enviado nuevamente" });
  }

  // *Verify Email
  public verifyEmail = async(req: Request, res: Response) => {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ error: "Token no proporcionado" });
    }
    
    new VerifyEmailUseCaseImpl(this.userRepository, this.jwtAdapter, this.bcrypt)
      .execute(token)
      .then((result) => {
        return res.status(200).send(result.message);
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  }

  // *Forgot Password
  public forgotPassword = async (req: Request, res: Response) => {
    const body = req.body;
    const [error, forgotPasswordDto] = ForgotPasswordDto.create(body);
    
    if (error) return res.status(400).json({ error: error });
    if (!forgotPasswordDto) return res.status(400).json({ error: "Datos incorrectos" });

    new ForgotPasswordUseCaseImpl(this.userRepository, this.jwtAdapter, this.emailService)
      .execute(forgotPasswordDto)
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((error) => {
        return res.status(500).json({ 
          message: "Error al enviar el email" 
        });
      });
  }

  // *Reset Password Page (Muestra la pagina usando server side rendering)
  public resetPasswordPage = async(req: Request, res: Response) => {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).send('<h1>Token no proporcionado</h1>');
    }

    try {
      const fs = require('fs');
      const path = require('path');
      const htmlPath = path.join(__dirname, '..', 'views', 'reset-password.html');
      let html = fs.readFileSync(htmlPath, 'utf8');
      
      html = html.replace('{{TOKEN}}', token);
      
      return res.send(html);
    } catch (error) {
      return res.status(500).send('<h1>Error al cargar la página</h1>');
    }
  }

  // *Reset Password Submit (Procesa el formulario usando server side rendering)
  public resetPasswordSubmit = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    const [error, resetPasswordDto] = ResetPasswordDto.create({ token, newPassword });
    
    if (error) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: red;">Error</h1>
            <p>${error}</p>
            <a href="/api/auth/reset-password-page/${token}" style="color: blue;">Volver a intentar</a>
          </body>
        </html>
      `);
    }
    if (!resetPasswordDto) return res.status(400).send('<h1>Datos incorrectos</h1>');

    new ResetPasswordUseCaseImpl(this.userRepository, this.jwtAdapter, this.bcrypt)
      .execute(resetPasswordDto)
      .then((result) => {
        //? Leer página de éxito
        try {
          const fs = require('fs');
          const path = require('path');
          const htmlPath = path.join(__dirname, '..', 'views', 'reset-password-success.html');
          const html = fs.readFileSync(htmlPath, 'utf8');
          
          return res.send(html);
        } catch (error) {
          return res.send('<h1>Contraseña actualizada exitosamente. Puedes cerrar esta ventana.</h1>');
        }
      })
      .catch((error) => {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: red;">Error</h1>
              <p>${error.message || 'Error al actualizar contraseña'}</p>
              <a href="/api/auth/forgot-password" style="color: blue;">Solicitar nuevo enlace</a>
            </body>
          </html>
        `);
      });
  }



  // *Refresh Token - Renovar access token usando refresh token
  public refreshToken = async(req: Request, res: Response) => {
    const body = req.body;
    const [error, refreshTokenDto] = RefreshTokenDto.create(body);
    
    if (error) return res.status(400).json({ error: error });
    if (!refreshTokenDto) return res.status(400).json({ error: "Datos incorrectos" });

    new RefreshTokenUseCase(this.userRepository, this.jwtAdapter)
      .execute(refreshTokenDto)
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  }
}