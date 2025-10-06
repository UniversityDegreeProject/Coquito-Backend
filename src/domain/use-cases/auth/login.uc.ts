import { LoginUserDto } from "../../dto/auth/login-user.dto";
import { UserEntity } from "../../entities";
import { AuthRepository, UserRepository } from "../../repositories";

export interface LoginUseCase {
  execute(loginUserDto: LoginUserDto): Promise<UserEntity>;
}


export class LoginUseCaseImpl implements LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository
  ) {
  }


  execute(loginUserDto: LoginUserDto): Promise<UserEntity> {
    return this.authRepository.loginUser(loginUserDto);
  }
}