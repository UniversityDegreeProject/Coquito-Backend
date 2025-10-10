import { Request, Response } from "express";
// *Domain
import { 
  HttpCustomErrors, 
  RegisterUserDto, 
  UserRepository, 
  CreateUserUseCaseImpl, 
  GetUsersUseCaseImpl, 
  LoginUserDto, 
  LoginUseCaseImpl, 
  AuthRepository,
  VerifyEmailUseCaseImpl,
  ForgotPasswordDto,
  ForgotPasswordUseCaseImpl,
  ResetPasswordDto,
  ResetPasswordUseCaseImpl
} from "../../../domain";
import { JwtAdapter } from "../../../config";
import { EmailService } from "../../../domain/services/email.service";


export class AuthController {
  constructor(
    private readonly userRepository : UserRepository,
    private readonly authRepository : AuthRepository,
    private readonly jwtAdapter : JwtAdapter,
    private readonly emailService : EmailService,

  ) {}

  private handleHttpStatusError = ( error: unknown, res : Response ) => {
    if( error instanceof HttpCustomErrors ) {
      return res.status(error.statusCode).json({ error: error.message }); 
    }
    return res.status(500).json({ error: "Internal server error" });
  }


  private sendEmailValidationLink =  async (id : string, email : string, username : string ) : Promise<boolean> => {
    const emailToken = await this.jwtAdapter.generateToken({ id, email }, "15m");
    if( !emailToken ) throw HttpCustomErrors.internalServerError("Error al generar el token de verificación de email");
    
    return this.emailService.sendEmailVerification(email, username, emailToken);

  }

  //* Get Users
  public getUsers = async(req: Request, res: Response) => {
    new GetUsersUseCaseImpl(this.userRepository).execute().then( users => {
      return res.status(200).json({ users });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }

  // *Login User
  public loginUser = async(req: Request, res: Response) => {
    const body = req.body;
    const [ error, loginUserDto ] = LoginUserDto.create(body);
    if( error ) return res.status(400).json({ error: error });
    if( !loginUserDto ) return res.status(400).json({ error: "El usuario no pudo ser creado" });

    
    // ? Login User

    new LoginUseCaseImpl(this.authRepository).execute(loginUserDto).then( async (user) => {

      //? Generar token
      
      const token = await this.jwtAdapter.generateToken({ id: user.id });
      if( !token ) return res.status(500).json({ error: "Error con el token de autenticación" });

      const { password, ...rest } = user;
      return res.status(200).json({ 
        user: rest,
        token: token
      });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }

  // *Register User
  public registerUser = async(req: Request, res: Response) => {
    const body = req.body;
    const [ error, registerUserDto ] = RegisterUserDto.create(body);
    if( error ) return res.status(400).json({ error: error });
    if( !registerUserDto ) return res.status(400).json({ error: "Datos incorrectos" });

    new CreateUserUseCaseImpl(this.userRepository).execute(registerUserDto).then( async (user) => {

      const { password, ...userWithoutPassword } = user;

      
      //? Generar token de verificación de email (válido por 2h)
      const emailSent = await this.sendEmailValidationLink( user.id, user.email, user.username);
      if( !emailSent ) return res.status(500).json({ error: "Error al enviar el email de verificación" });
     
      
      return res.status(201).json({ 
        user: userWithoutPassword,
        message: "Usuario creado exitosamente. Revisa tu email para verificar tu cuenta."
      });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }
  

  // *Verify Email
  public verifyEmail = async(req: Request, res: Response) => {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ error: "Token no proporcionado" });
    }
    
    // Usar el caso de uso de verificación de email
    new VerifyEmailUseCaseImpl(this.authRepository)
      .execute(token)
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  }

  // *Forgot Password
  public forgotPassword = async(req: Request, res: Response) => {
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

  // *Reset Password
  public resetPassword = async(req: Request, res: Response) => {
    const body = req.body;
    const [error, resetPasswordDto] = ResetPasswordDto.create(body);
    
    if (error) return res.status(400).json({ error: error });
    if (!resetPasswordDto) return res.status(400).json({ error: "Datos incorrectos" });

    new ResetPasswordUseCaseImpl(this.userRepository, this.jwtAdapter)
      .execute(resetPasswordDto)
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  }
}