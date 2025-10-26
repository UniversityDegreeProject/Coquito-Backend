import { RegisterUserDto } from "../dto/auth/register-user.dto";
import { DeleteUserByIdDto, GetUserByEmailDto, GetUserByIdDto, GetUserOptionalFiltersDto } from "../dto/user";
import { UpdateUserDto } from "../dto/user/update-user.dto";
import { UserEntity } from "../entities";
import { PaginateResponse } from "../interfaces/shared";


export abstract class UserDatasource {

  abstract getUsers( getUserOptionalFiltersDto: GetUserOptionalFiltersDto ): Promise<PaginateResponse<UserEntity>>;
  abstract createUser(user: RegisterUserDto): Promise<UserEntity>;
  abstract updateUser(user: UpdateUserDto): Promise<UserEntity>;
  abstract deleteUser(id: DeleteUserByIdDto): Promise<UserEntity>;
  abstract getUserById(id: GetUserByIdDto): Promise<UserEntity>;
  abstract getUserByEmail(email: GetUserByEmailDto): Promise<UserEntity>;

  
  // Métodos para Refresh Token
  abstract saveRefreshToken(userId: string, refreshToken: string): Promise<void>;
  abstract getUserByRefreshToken(refreshToken: string): Promise<UserEntity>;
  abstract removeRefreshToken(userId: string): Promise<void>;
}