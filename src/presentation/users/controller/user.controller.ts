import { Request, Response } from "express";
import { DeleteUserByIdDto, DeleteUserUseCaseImpl, GetUserByEmailDto, GetUserByIdDto, GetUserByIdUseCaseImpl, GetUserEmailUseCaseImpl, GetUsersUseCaseImpl, HttpCustomErrors, UpdateUserDto, UpdateUserUseCaseImpl, UserRepository } from "../../../domain";
import { SearchUsersDto } from "../../../domain/dto/user/search-users.dto";
import { SearchUsersUseCaseImpl } from "../../../domain/use-cases/user/search-users.uc";

export class UserController {
  constructor(
    private readonly userRepository: UserRepository
  ) {
    
  }

  private handleHttpStatusError = ( error: unknown, res: Response ) => {
    if( error instanceof HttpCustomErrors ) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }

  getAllUsers = async (req: Request, res: Response) => {
    new GetUsersUseCaseImpl(this.userRepository).execute().then( users => {
      return res.status(200).json({ users });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }

  getUserByEmail = async (req: Request, res: Response) => {
    const { email } = req.query;

    const [ error, getUserByEmailDto ] = GetUserByEmailDto.create({ email });
    if( error ) return res.status(400).json({ error: error });
    if( !getUserByEmailDto ) return res.status(400).json({ error: "User not found" });

    new GetUserEmailUseCaseImpl(this.userRepository).execute(getUserByEmailDto).then( user => {
      if( !user ) return res.status(404).json({ error: "User not found" });
      return res.status(200).json({ user });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }

  getUserById = async (req: Request, res: Response) => {
    const { id } = req.params; 

    const [ error, getUserByIdDto ] = GetUserByIdDto.create({ id });
    if( error ) return res.status(400).json({ error: error });
    if( !getUserByIdDto ) return res.status(400).json({ error: "User not found" });

    new GetUserByIdUseCaseImpl(this.userRepository).execute(getUserByIdDto).then( user => {
      if( !user ) return res.status(404).json({ error: "User not found" });
      return res.status(200).json({ user });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }

  updateUser = async (req: Request, res: Response) => {
    const { id } = req.params; 
    const body = req.body;    

    const [ error, updateUserDto ] = UpdateUserDto.create({ id, ...body });
    if( error ) return res.status(400).json({ error: error });
    if( !updateUserDto ) return res.status(400).json({ error: "User not found" });

    new UpdateUserUseCaseImpl(this.userRepository).execute(updateUserDto).then( user => {
      if( !user ) return res.status(404).json({ error: "User not found" });
      return res.status(200).json({ user });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }

  deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [ error, deleteUserDto ] = DeleteUserByIdDto.create({ id: id });
    if( error ) return res.status(400).json({ error: error });
    if( !deleteUserDto ) return res.status(400).json({ error: "Id user not found" });

    new DeleteUserUseCaseImpl(this.userRepository).execute(deleteUserDto).then( user => {
      if( !user ) return res.status(404).json({ error: "User not found" });
      return res.status(200).json({ 
        message: "Usuario eliminado exitosamente",
        user
       });
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }

  searchUsers = async (req: Request, res: Response) => {
    const query = req.query; 
    const [ error, searchUsersDto ] = SearchUsersDto.create(query);
    if( error ) return res.status(400).json({ error: error });
    if( !searchUsersDto ) return res.status(400).json({ error: "Invalid search parameters" });

    new SearchUsersUseCaseImpl(this.userRepository).execute(searchUsersDto).then( result => {
      return res.status(200).json(result);
    }).catch( error => {
      return this.handleHttpStatusError(error, res);
    });
  }
}