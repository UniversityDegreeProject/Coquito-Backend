import { RegisterUserDto } from "../dto/auth/register-user.dto";
import { DeleteUserByIdDto, GetUserByEmailDto, GetUserByIdDto } from "../dto/user";
import { UpdateUserDto } from "../dto/user/update-user.dto";
import { UserEntity } from "../entities";


export abstract class UserDatasource {

  abstract getUsers(): Promise<UserEntity[]>;
  abstract createUser(user: RegisterUserDto): Promise<UserEntity>;
  abstract updateUser(user: UpdateUserDto): Promise<UserEntity>;
  abstract deleteUser(id: DeleteUserByIdDto): Promise<UserEntity>;
  abstract getUserById(id: GetUserByIdDto): Promise<UserEntity>;
  abstract getUserByEmail(email: GetUserByEmailDto): Promise<UserEntity>;
  abstract getUserByUsername(username: string): Promise<UserEntity>;
}