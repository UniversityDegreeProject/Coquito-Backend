import { LoginUserDto } from "../dto/auth/login-user.dto";
import { UserEntity } from "../entities";


export abstract class AuthRepository {
  abstract loginUser(loginUserDto: LoginUserDto): Promise<UserEntity>;
}