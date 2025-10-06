import { RegisterUserDto } from "../dto/auth/register-user.dto";
import { UpdateUserDto } from "../dto/user/update-user.dto";
import { UserEntity } from "../entities";


export abstract class UserRepository {

  abstract getUsers(): Promise<UserEntity[]>;
  abstract createUser(user: RegisterUserDto): Promise<UserEntity>;
  abstract updateUser(user: UpdateUserDto): Promise<UserEntity>;
  abstract deleteUser(id: string | number): Promise<UserEntity>;
  abstract getUserById(id: string | number): Promise<UserEntity>;
  abstract getUserByEmail(email: string): Promise<UserEntity>;
  abstract getUserByUsername(username: string): Promise<UserEntity>;
}