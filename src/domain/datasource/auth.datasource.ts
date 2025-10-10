import { LoginUserDto } from "../dto/auth/login-user.dto";
import { UserEntity } from "../entities";


export abstract class AuthDatasource {
  abstract loginUser(loginUserDto: LoginUserDto): Promise<UserEntity>;
  abstract verifyEmail(token: string): Promise<{ message: string }>;
}