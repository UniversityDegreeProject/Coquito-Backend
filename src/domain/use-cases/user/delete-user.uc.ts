import { DeleteUserByIdDto } from "../../dto/user";
import { UserEntity } from "../../entities";
import { UserRepository } from "../../repositories";

interface DeleteUserUseCase {
  execute(id: DeleteUserByIdDto): Promise<UserEntity>;
}

export class DeleteUserUseCaseImpl implements DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(id: DeleteUserByIdDto): Promise<UserEntity> {
    return this.userRepository.deleteUser(id);
  }
}
