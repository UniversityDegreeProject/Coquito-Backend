import { RegisterUserDto } from "../../dto/auth/register-user.dto";
import { UserEntity } from "../../entities";
import { UserRepository } from "../../repositories";


export interface CreateUserUseCase {
  execute(user: RegisterUserDto): Promise<UserEntity>;
}


export class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  execute(user: RegisterUserDto): Promise<UserEntity> {
    return this.userRepository.createUser(user);
  }
}
