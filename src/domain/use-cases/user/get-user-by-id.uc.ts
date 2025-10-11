import { UserEntity } from "../../entities";
import { GetUserByIdDto } from "../../dto/user";
import { UserRepository } from "../../repositories";

interface GetUserIdUseCase {
  execute(id: GetUserByIdDto): Promise<UserEntity>;
}

export class GetUserByIdUseCaseImpl implements GetUserIdUseCase {

  constructor(private readonly userRepository: UserRepository) {}

  execute(id: GetUserByIdDto): Promise<UserEntity> {
    return this.userRepository.getUserById(id);
  }
}