import { UpdateUserDto } from "../../dto/user";
import { UserEntity } from "../../entities";
import { UserRepository } from "../../repositories";

interface UpdateUserUseCase {
  execute(user: UpdateUserDto): Promise<UserEntity>;
}


export class UpdateUserUseCaseImpl implements UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  execute(user: UpdateUserDto): Promise<UserEntity> {
    return this.userRepository.updateUser(user);
  }
}
