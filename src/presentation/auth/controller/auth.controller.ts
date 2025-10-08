import { Request, Response } from "express";
// *Domain
import { HttpCustomErrors, RegisterUserDto, UserRepository, CreateUserUseCaseImpl, GetUsersUseCaseImpl, LoginUserDto, LoginUseCaseImpl, AuthRepository } from "../../../domain";
import { JwtAdapter } from "../../../config";


export class AuthController {
  constructor(
    private readonly userRepository : UserRepository,
    private readonly authRepository : AuthRepository,
    private readonly jwtAdapter : JwtAdapter
  ) {}

  private handleHttpStatusError = ( error: unknown, res : Response ) => {
    if( error instanceof HttpCustomErrors ) {
      return res.status(error.statusCode).json({ error: error.message }); 
    }
    return res.status(500).json({ error: "Internal server error" });
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

    new CreateUserUseCaseImpl(this.userRepository).execute(registerUserDto).then( user => {
      return res.status(201).json({ 
        user,
      });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }
}