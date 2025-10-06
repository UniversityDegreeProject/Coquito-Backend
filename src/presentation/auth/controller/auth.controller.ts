import { Request, Response } from "express";
// *Domain
import { HttpCustomErrors, RegisterUserDto, UserRepository, CreateUserUseCaseImpl, GetUsersUseCaseImpl, LoginUserDto, LoginUseCaseImpl, AuthRepository } from "../../../domain";


export class AuthController {
  constructor(
    private readonly userRepository : UserRepository,
    private readonly authRepository : AuthRepository

  ) {
    
  }

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
    if( error ) return this.handleHttpStatusError(error, res);
    if( !loginUserDto ) return res.status(400).json({ error: "El usuario no pudo ser creado" });
    new LoginUseCaseImpl(this.authRepository).execute(loginUserDto).then( user => {
      return res.status(200).json({ 
        user,
        token: "abc123" 
      });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }

  // *Register User
  public registerUser = async(req: Request, res: Response) => {
    const body = req.body;
    const [ error, registerUserDto ] = RegisterUserDto.create(body);
    if( error ) return this.handleHttpStatusError(error, res);
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